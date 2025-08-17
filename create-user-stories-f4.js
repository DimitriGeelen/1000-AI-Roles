// Create User Stories for Feature #4: Event Creation & Management
const AzureDevOpsPlanner = require('./scripts/azure-devops-planner-impl.js');

async function createFeature4UserStories() {
    const planner = new AzureDevOpsPlanner();
    
    console.log('🚀 Creating User Stories for Feature #4: Event Creation & Management...');
    
    const userStories = [
        {
            command: 'CREATE_WORK_ITEM',
            agent: 'requirements-collector',
            data: {
                type: 'UserStory',
                title: 'Basic Event Creation Workflow (≤5 steps)',
                description: `**As an** event organizer (varying technical comfort levels)
**I want** to create a new event with essential information in ≤5 steps
**So that** I can quickly post events for my community to discover

**Acceptance Criteria:**
- **Given** I am an authenticated event organizer
- **When** I navigate to the event creation page
- **Then** I can complete event creation in maximum 5 steps
- **And** required fields include: event title, date/time, location, brief description
- **And** the interface is optimized for mobile-first usage
- **And** the process accommodates users with varying technical comfort levels`,
                parent_id: 4, // Feature #4
                priority: 1,
                estimate: 3,
                tags: ['event-creation', 'mobile-first', 'user-experience']
            }
        },
        {
            command: 'CREATE_WORK_ITEM',
            agent: 'requirements-collector',
            data: {
                type: 'UserStory',
                title: 'Event Information Management & Editing',
                description: `**As an** event organizer
**I want** to edit and update my published event details
**So that** I can keep event information accurate and current

**Acceptance Criteria:**
- **Given** I have created an event
- **When** I access my event management dashboard
- **Then** I can edit all event details (title, date, location, description)
- **And** changes are saved and immediately visible to event seekers
- **And** I can add optional enhanced information (contact details, pricing, special requirements)
- **And** the editing process maintains the same mobile-first design principles`,
                parent_id: 4, // Feature #4
                priority: 1,
                estimate: 2,
                tags: ['event-management', 'editing', 'dashboard']
            }
        },
        {
            command: 'CREATE_WORK_ITEM',
            agent: 'requirements-collector',
            data: {
                type: 'UserStory',
                title: 'Event Lifecycle Management (Delete/Archive)',
                description: `**As an** event organizer
**I want** to manage the complete lifecycle of my events
**So that** I can control event visibility and maintain accurate event listings

**Acceptance Criteria:**
- **Given** I have created events
- **When** I access my event management interface
- **Then** I can delete events that are cancelled or no longer relevant
- **And** I can mark events as "completed" to move them to archive
- **And** I can duplicate past events to create similar new events quickly
- **And** I receive confirmation before any permanent deletion actions`,
                parent_id: 4, // Feature #4
                priority: 2,
                estimate: 2,
                tags: ['event-lifecycle', 'delete', 'archive', 'duplicate']
            }
        },
        {
            command: 'CREATE_WORK_ITEM',
            agent: 'requirements-collector',
            data: {
                type: 'UserStory',
                title: 'Progressive Enhancement for Event Details',
                description: `**As an** event organizer who wants more detailed event listings
**I want** optional advanced features for enhanced event information
**So that** I can provide comprehensive details without overwhelming basic users

**Acceptance Criteria:**
- **Given** I am creating or editing an event
- **When** I choose to use enhanced features
- **Then** I can add optional details such as: event categories, contact information, registration requirements, accessibility information, pricing details
- **And** these enhanced features are clearly optional and don't interfere with basic creation flow
- **And** basic users can ignore enhanced features without impact to their experience
- **And** enhanced information is displayed appropriately to event seekers`,
                parent_id: 4, // Feature #4
                priority: 3,
                estimate: 1,
                tags: ['progressive-enhancement', 'optional-features', 'advanced-details']
            }
        }
    ];
    
    const results = [];
    
    for (const userStory of userStories) {
        try {
            console.log(`\n📝 Creating: ${userStory.data.title}`);
            const result = await planner.processCommand(userStory);
            
            if (result.success) {
                console.log(`✅ Created User Story #${result.work_item_id}: ${userStory.data.title}`);
                console.log(`   📍 URL: ${result.work_item_url}`);
                results.push({
                    title: userStory.data.title,
                    id: result.work_item_id,
                    url: result.work_item_url,
                    points: userStory.data.estimate,
                    success: true
                });
            } else {
                console.error(`❌ Failed to create: ${userStory.data.title}`);
                console.error(`   Error: ${result.message}`);
                results.push({
                    title: userStory.data.title,
                    error: result.message,
                    success: false
                });
            }
        } catch (error) {
            console.error(`💥 Exception creating ${userStory.data.title}: ${error.message}`);
            results.push({
                title: userStory.data.title,
                error: error.message,
                success: false
            });
        }
    }
    
    // Summary
    console.log('\n📊 Feature #4 User Stories Creation Summary:');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successfully created: ${successful.length}/4 User Stories`);
    console.log(`❌ Failed: ${failed.length}/4 User Stories`);
    
    if (successful.length > 0) {
        console.log('\n🎯 Created User Stories:');
        successful.forEach(story => {
            console.log(`   • #${story.id}: ${story.title} (${story.points} points)`);
        });
        
        const totalPoints = successful.reduce((sum, story) => sum + story.points, 0);
        console.log(`\n📈 Total Story Points: ${totalPoints}/8 (Target: 8 for Feature #4)`);
    }
    
    if (failed.length > 0) {
        console.log('\n❌ Failed User Stories:');
        failed.forEach(story => {
            console.log(`   • ${story.title}: ${story.error}`);
        });
    }
    
    return results;
}

// Execute if run directly
if (require.main === module) {
    createFeature4UserStories()
        .then(results => {
            process.exit(results.every(r => r.success) ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = createFeature4UserStories;