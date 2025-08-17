// Create User Stories for Feature #5: Event Discovery & Search
const AzureDevOpsPlanner = require('./scripts/azure-devops-planner-impl.js');

async function createFeature5UserStories() {
    const planner = new AzureDevOpsPlanner();
    
    console.log('🚀 Creating User Stories for Feature #5: Event Discovery & Search...');
    
    const userStories = [
        {
            command: 'CREATE_WORK_ITEM',
            agent: 'requirements-collector',
            data: {
                type: 'UserStory',
                title: 'Basic Event Search (≤3 steps)',
                description: `**As an** event seeker/attendee
**I want** to search for events in my area with ≤3 steps
**So that** I can quickly discover relevant community events

**Acceptance Criteria:**
- **Given** I am using the event discovery interface
- **When** I want to find events
- **Then** I can complete a basic search in maximum 3 steps
- **And** I can search by area (village, community, regional)
- **And** I can filter by timeslot (tonight, this weekend, specific dates)
- **And** search results display relevant events based on my criteria
- **And** the interface is optimized for mobile-first usage`,
                parent_id: 5, // Feature #5
                priority: 1,
                estimate: 2,
                tags: ['event-search', 'mobile-first', 'user-experience', 'discovery']
            }
        },
        {
            command: 'CREATE_WORK_ITEM',
            agent: 'requirements-collector',
            data: {
                type: 'UserStory',
                title: 'Event Filtering by Type & Category',
                description: `**As an** event seeker
**I want** to filter events by type and category
**So that** I can find specific kinds of events that interest me

**Acceptance Criteria:**
- **Given** I am viewing search results or browsing events
- **When** I want to narrow down event types
- **Then** I can filter by event type (town festivals, cultural events, community meetings, etc.)
- **And** I can apply multiple filters simultaneously
- **And** filter options are clearly displayed and easy to use on mobile
- **And** filtered results update immediately and show relevant events
- **And** I can easily clear filters to return to full results`,
                parent_id: 5, // Feature #5
                priority: 1,
                estimate: 2,
                tags: ['event-filtering', 'categories', 'event-types', 'mobile-ui']
            }
        },
        {
            command: 'CREATE_WORK_ITEM',
            agent: 'requirements-collector',
            data: {
                type: 'UserStory',
                title: 'Advanced Search with Progressive Enhancement',
                description: `**As a** community member who wants detailed event discovery
**I want** advanced search capabilities with optional enhancement features
**So that** I can find exactly the events I'm looking for without overwhelming basic users

**Acceptance Criteria:**
- **Given** I want more sophisticated search options
- **When** I access advanced search features
- **Then** I can search by additional criteria such as: distance from location, specific dates/times, event size, accessibility features, cost/free events
- **And** advanced features are clearly optional and don't interfere with basic search
- **And** I can save search preferences for future use
- **And** advanced search maintains the mobile-first design principles
- **And** basic users can ignore advanced features without impact to their search experience`,
                parent_id: 5, // Feature #5
                priority: 2,
                estimate: 1,
                tags: ['advanced-search', 'progressive-enhancement', 'saved-preferences', 'optional-features']
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
    console.log('\n📊 Feature #5 User Stories Creation Summary:');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successfully created: ${successful.length}/3 User Stories`);
    console.log(`❌ Failed: ${failed.length}/3 User Stories`);
    
    if (successful.length > 0) {
        console.log('\n🎯 Created User Stories:');
        successful.forEach(story => {
            console.log(`   • #${story.id}: ${story.title} (${story.points} points)`);
        });
        
        const totalPoints = successful.reduce((sum, story) => sum + story.points, 0);
        console.log(`\n📈 Total Story Points: ${totalPoints}/5 (Target: 5 for Feature #5)`);
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
    createFeature5UserStories()
        .then(results => {
            process.exit(results.every(r => r.success) ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = createFeature5UserStories;