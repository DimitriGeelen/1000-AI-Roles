# Quick Start: F&B Pricing Azure DevOps Integration

## 🚀 Create Your First PBI in 3 Steps

### Step 1: Get Your Personal Access Token
1. Go to: https://dev.azure.com/dimitri0310/_usersSettings/tokens
2. Click **"New Token"**
3. Name: `F&B Pricing API Access`
4. Scopes: **Work Items (Read & Write)**
5. Copy the token (you won't see it again!)

### Step 2: Set Up Environment
```bash
# Copy the example config
cp .env.example .env

# Edit .env file and add your PAT token:
# AZURE_DEVOPS_PAT=your-copied-token-here
```

### Step 3: Create Your First F&B Pricing PBI
```bash
node example-create-pbi.js
```

## 🍽️ What Gets Created

**F&B Dynamic Pricing User Story:**
- **Title**: "As a F&B manager, I want to set dynamic pricing rules for menu items"
- **Features**: Time-based pricing, demand-based adjustments, inventory management
- **Business Value**: 15-20% revenue increase, reduced food waste
- **Story Points**: 5 points
- **Priority**: High (1)

## 🔗 Your Project Links

- **Project Home**: https://dev.azure.com/dimitri0310/fnb-pricing
- **Work Items**: https://dev.azure.com/dimitri0310/fnb-pricing/_workitems
- **Boards**: https://dev.azure.com/dimitri0310/fnb-pricing/_boards

## 🛠️ Next Steps

1. **Create different work item types**:
   - Epic: "F&B Pricing Platform"
   - Features: "Dynamic Pricing Engine", "Inventory Integration"
   - Tasks: "API Development", "UI Components"

2. **Set up iterations** for your sprints
3. **Configure area paths** for different components

## 🎯 F&B Pricing Specific Fields

Your project might use these additional fields:
- **Business Value**: Revenue impact estimation
- **Risk**: Technical/business risk assessment  
- **Effort**: Development time estimation
- **Dependencies**: Integration requirements

Ready to optimize your F&B pricing! 🚀