#!/usr/bin/env node
// Create User Stories for Features #4 and #5
// This script creates the 7 User Stories designed by the Requirements Collector

// Load the Azure DevOps implementation
const path = require('path');
const AzureDevOpsPlanner = require('./scripts/azure-devops-planner-impl.js');

async function createUserStories() {
    const planner = new AzureDevOpsPlanner();
    
    console.log('🚀 Creating User Stories for Features #4 and #5...\n');
    
    // Feature #4: Event Creation & Management (8 pts) - User Stories
    console.log('📝 Creating User Stories for Feature #4: Event Creation & Management');
    
    // US016: Basic Event Creation Workflow (3 pts)
    const us016 = {
        "command": "CREATE_WORK_ITEM",
        "agent": "requirements-collector",
        "data": {
            "type": "User Story",
            "title": "US016: Basic Event Creation Workflow",
            "description": `As an event organizer with varying technical comfort levels, I want to create events in ≤5 steps with a mobile-first interface, So that I can quickly post community events without technical barriers.

**Acceptance Criteria:**
- Given I am an event organizer on a mobile device
- When I access the event creation workflow
- Then I can complete event creation in maximum 5 steps
- And I can enter essential information: title, date/time, location, description
- And the interface accommodates my technical comfort level
- And the process works optimally on smartphones`,
            "parent_id": "4",
            "priority": 1,
            "estimate": "3",
            "tags": ["functional", "must-have", "mobile-first"]
        }
    };
    
    // US017: Event Information Management & Editing (2 pts)
    const us017 = {
        "command": "CREATE_WORK_ITEM",
        "agent": "requirements-collector",
        "data": {
            "type": "User Story",
            "title": "US017: Event Information Management & Editing",
            "description": `As an event organizer, I want to edit and update my published event details, So that event information remains accurate and current for attendees.

**Acceptance Criteria:**
- Given I have created an event
- When I need to update event information
- Then I can access my event for editing
- And I can modify title, date/time, location, or description
- And changes are visible to event seekers in real-time
- And the editing interface is mobile-optimized`,
            "parent_id": "4",
            "priority": 1,
            "estimate": "2",
            "tags": ["functional", "must-have", "editing"]
        }
    };
    
    // US018: Event Lifecycle Management (2 pts)
    const us018 = {
        "command": "CREATE_WORK_ITEM",
        "agent": "requirements-collector",
        "data": {
            "type": "User Story",
            "title": "US018: Event Lifecycle Management",
            "description": `As an event organizer, I want to delete, archive, or duplicate my events, So that I can manage my events throughout their complete lifecycle.

**Acceptance Criteria:**
- Given I have created events
- When I need to manage event lifecycle
- Then I can delete events with confirmation prompts
- And I can archive past events for reference
- And I can duplicate events for recurring activities
- And all actions include appropriate confirmations
- And the interface provides clear lifecycle status`,
            "parent_id": "4",
            "priority": 2,
            "estimate": "2",
            "tags": ["functional", "should-have", "lifecycle"]
        }
    };
    
    // US019: Progressive Enhancement for Event Details (1 pt)
    const us019 = {
        "command": "CREATE_WORK_ITEM",
        "agent": "requirements-collector",
        "data": {
            "type": "User Story",
            "title": "US019: Progressive Enhancement for Event Details",
            "description": `As an event organizer who wants advanced features, I want optional enhanced event information capabilities, So that I can provide richer event details without overwhelming basic users.

**Acceptance Criteria:**
- Given I am comfortable with advanced features
- When I create or edit an event
- Then I can access optional advanced fields
- And basic users can ignore advanced features
- And enhanced features don't complicate the basic workflow
- And the interface clearly separates basic from advanced options`,
            "parent_id": "4",
            "priority": 3,
            "estimate": "1",
            "tags": ["functional", "could-have", "progressive-enhancement"]
        }
    };

    console.log('\n📝 Creating User Stories for Feature #5: Event Discovery & Search');
    
    // US020: Basic Event Search (2 pts)
    const us020 = {
        "command": "CREATE_WORK_ITEM",
        "agent": "requirements-collector",
        "data": {
            "type": "User Story",
            "title": "US020: Basic Event Search",
            "description": `As an event seeker/attendee, I want to discover events in ≤3 steps using area and timeslot search, So that I can quickly find relevant community events on my mobile device.

**Acceptance Criteria:**
- Given I am looking for community events
- When I access the event search feature
- Then I can complete event discovery in maximum 3 steps
- And I can search by area (village, community, regional)
- And I can search by timeslot (tonight, this weekend, specific dates)
- And the interface is optimized for mobile use
- And results are relevant to my search criteria`,
            "parent_id": "5",
            "priority": 1,
            "estimate": "2",
            "tags": ["functional", "must-have", "search"]
        }
    };
    
    // US021: Event Filtering by Type & Category (2 pts)
    const us021 = {
        "command": "CREATE_WORK_ITEM",
        "agent": "requirements-collector",
        "data": {
            "type": "User Story",
            "title": "US021: Event Filtering by Type & Category",
            "description": `As an event seeker, I want to filter events by type and category with multiple simultaneous filters, So that I can find specific types of events that interest me.

**Acceptance Criteria:**
- Given I am browsing or searching for events
- When I want to narrow down results
- Then I can filter by event types (festivals, cultural events, meetings)
- And I can apply multiple filters simultaneously
- And the mobile UI clearly shows active filters
- And I can easily remove or modify filters
- And filtered results update dynamically`,
            "parent_id": "5",
            "priority": 1,
            "estimate": "2",
            "tags": ["functional", "must-have", "filtering"]
        }
    };
    
    // US022: Advanced Search with Progressive Enhancement (1 pt)
    const us022 = {
        "command": "CREATE_WORK_ITEM",
        "agent": "requirements-collector",
        "data": {
            "type": "User Story",
            "title": "US022: Advanced Search with Progressive Enhancement",
            "description": `As a sophisticated event seeker, I want optional advanced search features and saved preferences, So that I can perform complex searches without complicating the basic search experience.

**Acceptance Criteria:**
- Given I want advanced search capabilities
- When I access search features
- Then I can use optional advanced search options
- And I can save search preferences for future use
- And advanced features don't interfere with basic search
- And the interface clearly separates basic from advanced search
- And saved preferences are easily accessible`,
            "parent_id": "5",
            "priority": 2,
            "estimate": "1",
            "tags": ["functional", "should-have", "advanced-search"]
        }
    };

    // Create all User Stories
    const userStories = [us016, us017, us018, us019, us020, us021, us022];
    const results = [];
    
    for (const story of userStories) {
        try {
            console.log(`\n🔄 Creating ${story.data.title}...`);
            const result = await planner.processCommand(story);
            results.push(result);
            
            if (result.success) {
                console.log(`✅ Created User Story #${result.work_item_id}: ${story.data.title}`);
                console.log(`🔗 Link: ${result.work_item_url}`);
            } else {
                console.error(`❌ Failed to create ${story.data.title}:`, result.message);
            }
        } catch (error) {
            console.error(`❌ Error creating ${story.data.title}:`, error.message);
            results.push({ success: false, error: error.message, title: story.data.title });
        }
    }
    
    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 USER STORY CREATION SUMMARY');
    console.log('═'.repeat(80));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successfully created: ${successful.length}/7 User Stories`);
    console.log(`❌ Failed: ${failed.length}/7 User Stories`);
    
    if (successful.length > 0) {
        console.log('\n✅ CREATED USER STORIES:');
        successful.forEach(result => {
            console.log(`   • User Story #${result.work_item_id} - ${result.work_item_url}`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ FAILED USER STORIES:');
        failed.forEach(result => {
            console.log(`   • ${result.title}: ${result.message || result.error}`);
        });
    }
    
    console.log('\n🎯 STORY POINT ALLOCATION:');
    console.log('   • Feature #4 (Event Creation & Management): 8 points');
    console.log('     - US016: 3 pts, US017: 2 pts, US018: 2 pts, US019: 1 pt');
    console.log('   • Feature #5 (Event Discovery & Search): 5 points');
    console.log('     - US020: 2 pts, US021: 2 pts, US022: 1 pt');
    console.log('   • Total: 13 story points across 7 User Stories');
    
    return results;
}

// Run the creation process
if (require.main === module) {
    createUserStories().then((results) => {
        console.log('\n🏁 User Story creation process complete.');
        process.exit(0);
    }).catch((error) => {
        console.error('💥 Fatal error during User Story creation:', error);
        process.exit(1);
    });
}

module.exports = { createUserStories };