# Azure DevOps Import Guide
## How to Set Up the Agent Builder SCRUM Board

---

## QUICK START (5 Minutes)

### Option 1: Manual Creation (Recommended for learning)
1. Open Azure DevOps → Your Project → Boards → Backlogs
2. Create Epics first (7 epics total)
3. Under each Epic, create User Stories
4. Under each User Story, create Tasks
5. Estimate Story Points and assign to sprints

### Option 2: CSV Import (Faster)
1. Export the CSV template from this guide
2. Azure DevOps → Boards → Backlogs → Import Work Items
3. Map columns to ADO fields
4. Review and import

### Option 3: REST API (Most Automated)
Use the PowerShell script provided below to bulk-create work items

---

## STEP-BY-STEP MANUAL SETUP

### Step 1: Create Epics (10 minutes)

Navigate to: **Boards → Backlogs → Epics**

Create 7 Epics with these details:

#### Epic 1: Security & Authentication
```
Title: Security & Authentication
Work Item Type: Epic
Priority: 1 (Critical)
Business Value: 100
Effort: 80
Start Date: [Sprint 1 start date]
Target Date: [Sprint 2 end date]
Description: Implement comprehensive security measures including authentication,
authorization, and vulnerability fixes to make the platform production-ready
and secure for multi-user environments.
```

#### Epic 2: Architecture Refactoring
```
Title: Architecture Refactoring
Work Item Type: Epic
Priority: 1 (Critical)
Business Value: 90
Effort: 100
Start Date: [Sprint 2 start date]
Target Date: [Sprint 3 end date]
Description: Refactor monolithic components and oversized context to improve
maintainability, performance, and developer experience.
```

#### Epic 3: Performance Optimization
```
Title: Performance Optimization
Work Item Type: Epic
Priority: 2 (High)
Business Value: 80
Effort: 60
Start Date: [Sprint 3 start date]
Target Date: [Sprint 4 end date]
Description: Implement code splitting, lazy loading, caching, and performance
optimizations to achieve <2s page load time.
```

#### Epic 4: Multi-Tenancy & SaaS Features
```
Title: Multi-Tenancy & SaaS Features
Work Item Type: Epic
Priority: 1 (Critical)
Business Value: 100
Effort: 90
Start Date: [Sprint 4 start date]
Target Date: [Sprint 5 end date]
Description: Implement workspace management, data isolation, and RBAC to
support multiple organizations on the platform.
```

#### Epic 5: Testing & Quality Assurance
```
Title: Testing & Quality Assurance
Work Item Type: Epic
Priority: 2 (High)
Business Value: 70
Effort: 55
Start Date: [Sprint 5 start date]
Target Date: [Sprint 6 end date]
Description: Establish comprehensive testing infrastructure including unit,
component, and E2E tests with >70% coverage.
```

#### Epic 6: DevOps & Production Readiness
```
Title: DevOps & Production Readiness
Work Item Type: Epic
Priority: 1 (Critical)
Business Value: 100
Effort: 70
Start Date: [Sprint 6 start date]
Target Date: [Sprint 6 end date]
Description: Create Docker containers, CI/CD pipeline, and production
deployment infrastructure for reliable SaaS operation.
```

#### Epic 7: TypeScript Migration
```
Title: TypeScript Migration
Work Item Type: Epic
Priority: 3 (Medium)
Business Value: 60
Effort: 80
Start Date: [Sprint 7 start date]
Target Date: [Sprint 8 end date]
Description: Migrate entire codebase from JavaScript to TypeScript for
improved type safety and developer experience.
```

---

### Step 2: Create User Stories (30 minutes)

For each Epic, create User Stories. Example for Epic 1:

#### User Story 1.1
```
Title: Fix Path Traversal Vulnerability
Work Item Type: User Story
Parent: Epic 1 - Security & Authentication
Priority: 1
Story Points: 5
Iteration: Sprint 1
Assigned To: Backend Developer
Description: As a security engineer, I need to fix the path traversal
vulnerability in vite.config.js so that attackers cannot read arbitrary
files from the server.

Acceptance Criteria:
- Path validation uses path.resolve() with whitelist checking
- All user-provided paths are sanitized
- Absolute paths and symlinks are rejected
- Security testing confirms vulnerability is patched
- No regression in legitimate file access
```

#### User Story 1.2
```
Title: Implement JWT Authentication
Work Item Type: User Story
Parent: Epic 1 - Security & Authentication
Priority: 1
Story Points: 13
Iteration: Sprint 1
Assigned To: Full Stack Developer
Description: As a platform administrator, I need to implement JWT-based
authentication so that only authorized users can access the platform and
their data is protected.

Acceptance Criteria:
- Users can login with username/password
- JWT tokens are issued upon successful login
- Tokens expire after configurable time (default 24h)
- Refresh token mechanism works
- All API endpoints validate JWT tokens
- Frontend stores tokens securely
- Logout clears tokens
```

**Repeat for all 50+ User Stories** (see ADO_SCRUM_BOARD.md for complete list)

---

### Step 3: Create Tasks (1-2 hours)

For each User Story, create detailed tasks. Example for US 1.1:

#### Task 1.1.1
```
Title: Implement Path Validation Function
Work Item Type: Task
Parent: US 1.1 - Fix Path Traversal Vulnerability
Original Estimate: 2 hours
Assigned To: Backend Developer
Description: Create secure path validation utility function

Implementation Steps:
[See ADO_SCRUM_BOARD.md line 100-150 for full implementation code]
```

#### Task 1.1.2
```
Title: Update Vite Middleware to Use Path Validator
Work Item Type: Task
Parent: US 1.1 - Fix Path Traversal Vulnerability
Original Estimate: 3 hours
Assigned To: Backend Developer
Description: Replace insecure regex with secure path validation in all
Vite middleware endpoints

Files to Update:
- vite.config.js lines 93, 134, 167, 199
[See ADO_SCRUM_BOARD.md for full implementation]
```

---

## CSV IMPORT TEMPLATE

Create a CSV file with these columns:

```csv
Work Item Type,Title,Parent,Priority,Story Points,Iteration,Assigned To,Description,Acceptance Criteria
Epic,Security & Authentication,,1,80,,"Implement comprehensive security measures..."
User Story,Fix Path Traversal Vulnerability,Security & Authentication,1,5,Sprint 1,Backend Developer,"As a security engineer, I need to...","- Path validation uses path.resolve()..."
Task,Implement Path Validation Function,Fix Path Traversal Vulnerability,1,,Sprint 1,Backend Developer,"Create secure path validation utility",
Task,Update Vite Middleware,Fix Path Traversal Vulnerability,1,,Sprint 1,Backend Developer,"Replace insecure regex",
```

**To Import:**
1. Save CSV file
2. Azure DevOps → Boards → Backlogs → ... (menu) → Import Work Items
3. Select CSV file
4. Map columns:
   - Work Item Type → Work Item Type
   - Title → Title
   - Parent → Parent
   - Priority → Priority
   - Story Points → Story Points
   - Iteration → Iteration Path
   - Assigned To → Assigned To
   - Description → Description
5. Preview and Import

---

## POWERSHELL BULK CREATION SCRIPT

```powershell
# Azure DevOps Bulk Work Item Creator
# Prerequisites: Install Azure DevOps CLI - https://aka.ms/azure-devops-cli

# Configuration
$organization = "YOUR_ORG"
$project = "YOUR_PROJECT"
$pat = "YOUR_PERSONAL_ACCESS_TOKEN"

# Login
az devops login --organization "https://dev.azure.com/$organization"

# Function to create Epic
function Create-Epic {
    param(
        [string]$title,
        [int]$priority,
        [int]$businessValue,
        [int]$effort,
        [string]$description
    )

    $epic = az boards work-item create `
        --title $title `
        --type Epic `
        --org "https://dev.azure.com/$organization" `
        --project $project `
        --fields "Microsoft.VSTS.Common.Priority=$priority" `
                 "Microsoft.VSTS.Common.BusinessValue=$businessValue" `
                 "Microsoft.VSTS.Scheduling.Effort=$effort" `
                 "System.Description=$description"

    return ($epic | ConvertFrom-Json).id
}

# Function to create User Story
function Create-UserStory {
    param(
        [string]$title,
        [int]$parentId,
        [int]$priority,
        [int]$storyPoints,
        [string]$iteration,
        [string]$assignedTo,
        [string]$description,
        [string]$acceptanceCriteria
    )

    az boards work-item create `
        --title $title `
        --type "User Story" `
        --org "https://dev.azure.com/$organization" `
        --project $project `
        --fields "System.Parent=$parentId" `
                 "Microsoft.VSTS.Common.Priority=$priority" `
                 "Microsoft.VSTS.Scheduling.StoryPoints=$storyPoints" `
                 "System.IterationPath=$iteration" `
                 "System.AssignedTo=$assignedTo" `
                 "System.Description=$description" `
                 "Microsoft.VSTS.Common.AcceptanceCriteria=$acceptanceCriteria"
}

# Function to create Task
function Create-Task {
    param(
        [string]$title,
        [int]$parentId,
        [int]$hours,
        [string]$assignedTo,
        [string]$description
    )

    az boards work-item create `
        --title $title `
        --type Task `
        --org "https://dev.azure.com/$organization" `
        --project $project `
        --fields "System.Parent=$parentId" `
                 "Microsoft.VSTS.Scheduling.OriginalEstimate=$hours" `
                 "System.AssignedTo=$assignedTo" `
                 "System.Description=$description"
}

# Create Epic 1: Security & Authentication
$epic1Id = Create-Epic `
    -title "Security & Authentication" `
    -priority 1 `
    -businessValue 100 `
    -effort 80 `
    -description "Implement comprehensive security measures including authentication, authorization, and vulnerability fixes."

Write-Host "Created Epic 1: $epic1Id"

# Create User Story 1.1
$us11Id = Create-UserStory `
    -title "Fix Path Traversal Vulnerability" `
    -parentId $epic1Id `
    -priority 1 `
    -storyPoints 5 `
    -iteration "Sprint 1" `
    -assignedTo "backend.developer@company.com" `
    -description "As a security engineer, I need to fix the path traversal vulnerability..." `
    -acceptanceCriteria "- Path validation uses path.resolve()..."

Write-Host "Created User Story 1.1: $us11Id"

# Create Tasks for US 1.1
Create-Task `
    -title "Implement Path Validation Function" `
    -parentId $us11Id `
    -hours 2 `
    -assignedTo "backend.developer@company.com" `
    -description "Create secure path validation utility function"

Create-Task `
    -title "Update Vite Middleware" `
    -parentId $us11Id `
    -hours 3 `
    -assignedTo "backend.developer@company.com" `
    -description "Replace insecure regex with secure path validation"

# Repeat for all epics, user stories, and tasks...
Write-Host "Work items created successfully!"
```

**To Use:**
1. Update configuration variables at top of script
2. Run: `powershell -File create-work-items.ps1`
3. Wait for completion (may take 5-10 minutes for all items)

---

## BOARD CONFIGURATION

### Configure Columns
1. **Boards → Board settings → Columns**
2. Add these columns:
   - New
   - Active
   - In Review
   - Testing
   - Done
3. Map states:
   - New → New
   - Active → Active, Committed
   - In Review → Resolved
   - Testing → Testing
   - Done → Closed

### Configure Swimlanes
1. **Boards → Board settings → Swimlanes**
2. Add swimlanes:
   - Expedite (for critical bugs)
   - Sprint 1
   - Sprint 2
   - Sprint 3
   - ...

### Configure Card Fields
1. **Boards → Board settings → Cards**
2. Show these fields on cards:
   - Assigned To
   - Story Points
   - Tags
   - Priority
   - Iteration Path

---

## SPRINT SETUP

### Create Iterations
1. **Project Settings → Project configuration → Iterations**
2. Add iterations:
   ```
   - Sprint 1 (2 weeks)
   - Sprint 2 (2 weeks)
   - Sprint 3 (2 weeks)
   - Sprint 4 (2 weeks)
   - Sprint 5 (2 weeks)
   - Sprint 6 (2 weeks)
   - Sprint 7 (2 weeks)
   - Sprint 8 (2 weeks)
   ```
3. Set start and end dates for each sprint

### Assign Work to Sprints
1. **Boards → Backlogs → Backlog items**
2. Drag User Stories to appropriate sprint
3. Sprint 1 should contain:
   - US 1.1: Fix Path Traversal Vulnerability
   - US 1.2: Implement JWT Authentication
   - US 1.3: Secure WebSocket Connections
   - US 1.4: Add Request Validation
   - US 1.5: Implement CORS & CSP Headers
   - US 1.6: Security Audit

---

## DASHBOARDS & REPORTING

### Create Sprint Dashboard
1. **Overview → Dashboards → New Dashboard**
2. Name: "Sprint Dashboard"
3. Add widgets:
   - **Sprint Burndown** - Track sprint progress
   - **Sprint Capacity** - Team capacity vs work
   - **Cumulative Flow Diagram** - Work in progress
   - **Velocity** - Team velocity over sprints
   - **Bug Status** - Active bugs count
   - **Test Results** - Test pass rate

### Create Epic Dashboard
1. **Overview → Dashboards → New Dashboard**
2. Name: "Epic Progress"
3. Add widgets:
   - **Epic Burndown** - Progress on each epic
   - **Feature Progress** - % complete per epic
   - **Work Item Chart** - User stories by state
   - **Lead Time** - Time to complete user stories

---

## TEAM CONFIGURATION

### Add Team Members
1. **Project Settings → Teams → [Your Team] → Members**
2. Add team members with roles:
   - 2x Full Stack Developers
   - 2x Frontend Developers
   - 1x Backend Developer
   - 1x DevOps Engineer
   - 1x QA Engineer
   - 1x Scrum Master
   - 1x Product Owner

### Set Capacity
1. **Boards → Sprints → Capacity**
2. For each team member, set:
   - Days off
   - Hours per day (usually 6 productive hours)
   - Capacity per discipline (Development, Testing, etc.)

---

## AUTOMATION RULES

### Auto-assign to Sprint
```yaml
Rule Name: Auto-assign to Current Sprint
Trigger: Work item created
Conditions: Work item type = Task, Parent exists
Actions: Set Iteration Path = @CurrentIteration
```

### Auto-transition on PR Merge
```yaml
Rule Name: Move to Testing on PR Merge
Trigger: Pull request merged
Conditions: Linked work items exist
Actions: Set State = Testing
```

### Notify on High Priority
```yaml
Rule Name: Alert Team on Critical Priority
Trigger: Field changed
Conditions: Priority = 1 (Critical)
Actions: Send email to team, Post to Slack channel
```

---

## INTEGRATION WITH GITHUB

### Link GitHub Repository
1. **Project Settings → GitHub connections**
2. Click "Connect your GitHub account"
3. Authorize Azure DevOps
4. Select repository: `yourorg/agent-builder`
5. Map branches:
   - main → Production
   - develop → Staging

### Configure Branch Policies
1. **Repos → Branches → main → Branch policies**
2. Enable:
   - Require pull request reviews (minimum 1)
   - Check for linked work items
   - Require build validation
   - Require comment resolution

### Work Item Linking in Commits
```bash
# Commit message format
git commit -m "Fix path traversal vulnerability #123"

# Or in PR description
Fixes AB#123
Resolves AB#124
```

---

## METRICS & KPIs TO TRACK

### Sprint Metrics (Review Weekly)
- [ ] Sprint Burndown - On track?
- [ ] Velocity - Average story points per sprint
- [ ] Sprint Goal Achievement - % of committed work completed
- [ ] Bugs Found - Number of bugs discovered
- [ ] Bugs Fixed - Number of bugs resolved

### Quality Metrics (Review Sprint End)
- [ ] Test Coverage - % of code covered by tests
- [ ] Code Review Turnaround - Avg time for PR review
- [ ] Build Success Rate - % of builds passing
- [ ] Deployment Frequency - How often we deploy
- [ ] Mean Time to Recovery - Avg time to fix production issues

### Process Metrics (Review Monthly)
- [ ] Cycle Time - Work item creation to done
- [ ] Lead Time - Request to delivery
- [ ] WIP (Work in Progress) - Items in active state
- [ ] Throughput - Items completed per week

---

## TROUBLESHOOTING

### Issue: Can't create Epic
**Solution:** Check project permissions. You need "Stakeholder" or higher access.

### Issue: Can't assign to Sprint
**Solution:** Sprints must be created in Project Settings → Iterations first.

### Issue: Parent link not working
**Solution:** Ensure parent Epic is created before child User Stories.

### Issue: Story Points not summing up
**Solution:** Go to Board Settings → Card fields → Enable Story Points rollup.

### Issue: CSV import fails
**Solution:** Check CSV encoding (must be UTF-8) and column mappings.

---

## BEST PRACTICES

### 1. Daily Standup Checklist
- [ ] What did I complete yesterday?
- [ ] What will I work on today?
- [ ] Any blockers?
- [ ] Update work item states in ADO
- [ ] Log hours worked

### 2. Sprint Planning Checklist
- [ ] Review product backlog
- [ ] Prioritize user stories
- [ ] Estimate story points
- [ ] Check team capacity
- [ ] Commit to sprint goal
- [ ] Break down large stories
- [ ] Create tasks for each story

### 3. Sprint Review Checklist
- [ ] Demo completed user stories
- [ ] Get stakeholder feedback
- [ ] Update product backlog
- [ ] Review sprint metrics
- [ ] Celebrate wins!

### 4. Sprint Retrospective Checklist
- [ ] What went well?
- [ ] What could be improved?
- [ ] Action items for next sprint
- [ ] Update team agreements
- [ ] Review velocity trends

---

## QUICK REFERENCE COMMANDS

### Azure DevOps CLI Commands
```bash
# List all work items in project
az boards work-item list --project "YourProject"

# Get work item details
az boards work-item show --id 123

# Update work item
az boards work-item update --id 123 --state "Active"

# Create work item
az boards work-item create --title "New Task" --type Task

# Query work items
az boards query --wiql "SELECT [System.Id] FROM WorkItems WHERE [System.State] = 'Active'"
```

---

## SUPPORT & RESOURCES

### Documentation
- [Azure DevOps Boards Docs](https://learn.microsoft.com/en-us/azure/devops/boards/)
- [SCRUM Guide](https://scrumguides.org/)
- [Story Points Estimation](https://www.atlassian.com/agile/project-management/estimation)

### Training
- [Azure DevOps Learning Path](https://learn.microsoft.com/en-us/training/paths/evolve-your-devops-practices/)
- [Agile Fundamentals](https://www.scrumalliance.org/learn-about-scrum)

### Community
- [Azure DevOps Community](https://developercommunity.visualstudio.com/AzureDevOps)
- [Stack Overflow - azure-devops](https://stackoverflow.com/questions/tagged/azure-devops)

---

**Last Updated:** 2026-02-23
**Version:** 1.0
**Maintained By:** Technical Lead

For questions or issues with this guide, contact the Scrum Master or DevOps team.
