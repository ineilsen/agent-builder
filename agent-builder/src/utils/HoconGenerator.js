/**
 * HoconGenerator - Converts React Flow graph to HOCON format
 * Reverse of HoconGraphMapper
 *
 * Usage:
 *   import HoconGenerator from '../utils/HoconGenerator';
 *   const hoconString = HoconGenerator.generateHocon(nodes, edges, metadata);
 */

class HoconGenerator {

  /**
   * Main entry point - generates complete HOCON file
   * @param {Array<Node>} nodes - React Flow nodes
   * @param {Array<Edge>} edges - React Flow edges
   * @param {Object} metadata - Network metadata
   * @returns {string} Formatted HOCON string
   */
  generateHocon(nodes, edges, metadata = {}) {
    // Validate inputs
    this.validateInputs(nodes, edges);

    // Build HOCON structure
    const hoconStructure = {
      metadata: this.buildMetadata(metadata),
      llm_config: this.buildLlmConfig(metadata),
      tools: this.buildToolsArray(nodes, edges)
    };

    // Format as HOCON string
    return this.formatHocon(hoconStructure);
  }

  /**
   * Validates graph structure
   */
  validateInputs(nodes, edges) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      throw new Error('Nodes array is required and cannot be empty');
    }

    if (!Array.isArray(edges)) {
      throw new Error('Edges array is required');
    }

    // Check for frontman/entry point
    const hasFrontman = nodes.some(n => n.data?.type === 'frontman' || n.data?.type === 'agent');
    if (!hasFrontman) {
      console.warn('No agent node found - export may be incomplete');
    }
  }

  /**
   * Builds tools array in hierarchical order
   */
  buildToolsArray(nodes, edges) {
    const tools = [];
    const visited = new Set();

    // Find entry point (frontman or first agent)
    const entryNode = nodes.find(n => n.data?.type === 'frontman') ||
                      nodes.find(n => n.data?.type === 'agent') ||
                      nodes[0];

    if (!entryNode) {
      throw new Error('No valid entry point found in graph');
    }

    // Depth-first traversal
    this.traverseAndBuild(entryNode, nodes, edges, tools, visited);

    // Add any orphaned nodes
    nodes.forEach(node => {
      if (!visited.has(node.id) && node.data?.type !== 'sub-network') {
        tools.push(this.buildToolObject(node, nodes, edges));
      }
    });

    return tools;
  }

  /**
   * Recursive graph traversal
   */
  traverseAndBuild(node, allNodes, edges, tools, visited) {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    // Build tool object
    const toolObj = this.buildToolObject(node, allNodes, edges);
    tools.push(toolObj);

    // Find children
    const children = edges
      .filter(e => e.source === node.id)
      .map(e => allNodes.find(n => n.id === e.target))
      .filter(Boolean);

    // Recurse
    children.forEach(child => {
      this.traverseAndBuild(child, allNodes, edges, tools, visited);
    });
  }

  /**
   * Builds individual tool object from node
   */
  buildToolObject(node, allNodes, edges) {
    const data = node.data || {};

    const tool = {
      name: node.id,
      function: {
        description: data.description || data.label || '',
        parameters: data.functionParams || {},
        required: data.requiredParams || []
      },
      instructions: data.instructions || ''
    };

    // Add child tools
    const children = edges
      .filter(e => e.source === node.id)
      .map(e => e.target);

    if (children.length > 0) {
      tool.tools = children;
    }

    // Add command if AAOSA pattern
    if (data.command) {
      tool.command = data.command;
    }

    // Add LLM config if agent-specific
    if (data.model || data.temperature !== undefined) {
      tool.llm_config = {};
      if (data.model) tool.llm_config.model_name = data.model;
      if (data.temperature !== undefined) tool.llm_config.temperature = data.temperature;
      if (data.maxTokens) tool.llm_config.max_tokens = data.maxTokens;
    }

    // Add selected tools/MCP
    if (data.selectedTools && data.selectedTools.length > 0) {
      tool.tools = [...(tool.tools || []), ...data.selectedTools];
    }

    if (data.selectedMcp && data.selectedMcp.length > 0) {
      tool.mcp_servers = data.selectedMcp;
    }

    return tool;
  }

  /**
   * Formats JavaScript object as HOCON string
   */
  formatHocon(structure) {
    let hocon = '{\n';

    // Metadata
    if (structure.metadata && Object.keys(structure.metadata).length > 0) {
      hocon += '  "metadata": {\n';
      Object.entries(structure.metadata).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const formatted = typeof value === 'string' ? `"${this.escapeString(value)}"` : JSON.stringify(value);
          hocon += `    "${key}": ${formatted},\n`;
        }
      });
      hocon = hocon.replace(/,\n$/, '\n'); // Remove trailing comma
      hocon += '  },\n\n';
    }

    // LLM Config
    if (structure.llm_config && Object.keys(structure.llm_config).length > 0) {
      hocon += '  "llm_config": {\n';
      Object.entries(structure.llm_config).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const formatted = typeof value === 'string' ? `"${value}"` : value;
          hocon += `    "${key}": ${formatted},\n`;
        }
      });
      hocon = hocon.replace(/,\n$/, '\n');
      hocon += '  },\n\n';
    }

    // Tools Array
    hocon += '  "tools": [\n';
    structure.tools.forEach((tool, index) => {
      hocon += this.formatTool(tool, index < structure.tools.length - 1);
    });
    hocon += '  ]\n';

    hocon += '}\n';
    return hocon;
  }

  /**
   * Formats individual tool with proper indentation
   */
  formatTool(tool, addComma) {
    let formatted = '    {\n';

    // Name
    formatted += `      "name": "${this.escapeString(tool.name)}",\n`;

    // Function
    formatted += '      "function": {\n';
    formatted += `        "description": "${this.escapeString(tool.function.description)}",\n`;
    formatted += `        "parameters": ${JSON.stringify(tool.function.parameters, null, 8).split('\n').map((line, i) => i === 0 ? line : '        ' + line).join('\n')},\n`;
    formatted += `        "required": ${JSON.stringify(tool.function.required)}\n`;
    formatted += '      },\n';

    // Instructions (handle triple quotes for multiline)
    const instructions = tool.instructions || '';
    if (instructions.includes('\n') || instructions.length > 80) {
      const indented = instructions.split('\n').map(line => '        ' + line).join('\n');
      formatted += '      "instructions": """\n';
      formatted += indented + '\n';
      formatted += '      """,\n';
    } else {
      formatted += `      "instructions": "${this.escapeString(instructions)}",\n`;
    }

    // Optional fields
    if (tool.tools && tool.tools.length > 0) {
      formatted += `      "tools": [${tool.tools.map(t => `"${this.escapeString(t)}"`).join(', ')}],\n`;
    }

    if (tool.command) {
      formatted += `      "command": ${JSON.stringify(tool.command)},\n`;
    }

    if (tool.llm_config && Object.keys(tool.llm_config).length > 0) {
      formatted += '      "llm_config": {\n';
      Object.entries(tool.llm_config).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const v = typeof value === 'string' ? `"${value}"` : value;
          formatted += `        "${key}": ${v},\n`;
        }
      });
      formatted = formatted.replace(/,\n$/, '\n');
      formatted += '      },\n';
    }

    if (tool.mcp_servers && tool.mcp_servers.length > 0) {
      formatted += `      "mcp_servers": [${tool.mcp_servers.map(m => `"${this.escapeString(m)}"`).join(', ')}],\n`;
    }

    // Remove trailing comma from last field
    formatted = formatted.replace(/,\n([^\n]*\n[^\n]*$)/, '\n$1');
    formatted += `    }${addComma ? ',' : ''}\n`;

    return formatted;
  }

  /**
   * Escapes special characters in strings
   */
  escapeString(str) {
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  buildMetadata(meta) {
    const metadata = {};

    if (meta.description) metadata.description = meta.description;
    if (meta.sample_queries && meta.sample_queries.length > 0) {
      metadata.sample_queries = meta.sample_queries;
    }

    metadata.created_at = new Date().toISOString();
    metadata.created_by = 'Agent Builder V2';

    return metadata;
  }

  buildLlmConfig(meta) {
    const config = {};

    if (meta.model) config.model_name = meta.model;
    if (meta.temperature !== undefined) config.temperature = meta.temperature;
    if (meta.maxTokens) config.max_tokens = meta.maxTokens;
    if (meta.topP !== undefined) config.top_p = meta.topP;

    // Defaults
    if (!config.model_name) config.model_name = 'gpt-4o';
    if (config.temperature === undefined) config.temperature = 0.7;
    if (!config.max_tokens) config.max_tokens = 2000;

    return config;
  }
}

export default new HoconGenerator();
