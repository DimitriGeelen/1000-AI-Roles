# Project Brief: Community Event Discovery App

## Version History
- v1.0 (2025-08-17): Initial project brief from discovery session

## Project Overview
A lightweight, frictionless community event discovery app designed to solve the hidden event problem in sparsely populated areas, starting with a 150-person village and scaling to wider communities.

## Problem Statement

### Core Problem
Valuable local events occur daily (especially in summer) but remain hidden from community members because they're only promoted through paper posters on information boards or private networks (fragmented WhatsApp groups limited to individual villages).

### Impact
- **Immediate Need**: People wanting to do something "tonight" or "Sunday with kids" have no central discovery method
- **Lost Opportunities**: Community members regularly miss events they would have loved to attend
- **Information Fragmentation**: Events aren't comprehensively shared even within existing WhatsApp groups
- **Discovery Friction**: No searchable, time-sensitive way to find local activities

### Problem Scale
- **Primary Target**: Village of 150 people
- **Secondary Target**: Larger community of 6,000 people
- **Extended Vision**: Regional area of 50,000 people
- **Frequency**: Daily events during summer season, regular events year-round

## Target Users

### Primary Users
1. **Event Seekers**: Community members looking for activities by area, time, and type
2. **Event Organizers**: Local groups, cultural organizations, and community volunteers posting events

### User Characteristics
- **Technical Capability**: Wide smartphone and internet adoption
- **Comfort Level**: Mixed technical comfort among organizers (older volunteers to younger cultural event runners)
- **Usage Pattern**: Immediate-need driven ("what's happening tonight/this weekend")

## Success Criteria

### Primary Success Metrics
- **Village Adoption**: 100% usage rate (150 people) within initial deployment
- **Event Coverage**: Majority of local town festivals and cultural events posted within app
- **Discovery Success**: Users find events they wouldn't have known about otherwise
- **Reduced Fragmentation**: Decreased reliance on fragmented WhatsApp group event sharing

### Secondary Success Metrics
- **Engagement**: Regular usage for "what's happening now" queries
- **Event Attendance**: Increased participation in community events
- **Content Quality**: Event information completeness and accuracy
- **Scale Readiness**: Architecture supports expansion to 5,000-50,000 users

## Constraints

### Technical Constraints
- **Infrastructure**: Good internet connectivity and smartphone adoption available
- **Development Method**: Must utilize Azure DevOps Planner for project management
- **Timeline**: Launch basic version within next few weeks

### Usability Constraints (Frictionless Requirements)
- **Event Posting**: Maximum 5 steps for basic event creation by organizers
- **Event Discovery**: Maximum 3 steps to search by area, timeslot, and event type
- **Progressive Enhancement**: Optional additional steps for:
  - Organizers: Adding detailed information/artifacts to events
  - Users: Refining search parameters with advanced filters

### User Experience Constraints
- **Simplicity First**: "Simple by default, powerful by choice" design philosophy
- **Low Learning Curve**: Interface must accommodate varying technical comfort levels
- **Mobile-First**: Primary usage expected on smartphones

## Scope

### In Scope
- **Core Event Management**: Create, edit, delete events
- **Frictionless Discovery**: Search by location, time, and event type
- **Event Categories**: Focus on town festivals and cultural events
- **Basic Event Information**: Title, date/time, location, brief description
- **Progressive Enhancement**: Optional detailed information and advanced search
- **Multi-Village Support**: Architecture for village → community → regional scaling

### Phase 1 (Village Pilot - 150 people)
- Basic event posting (≤5 steps)
- Simple search (≤3 steps)
- Core event types: town festivals, cultural events
- Single village geographic scope

### Phase 2 (Community Expansion - 6,000 people)
- Multi-village support
- Enhanced search refinement
- Detailed event information options
- Performance optimization for larger user base

### Phase 3 (Regional Scale - 50,000 people)
- Full regional coverage
- Advanced filtering and discovery features
- Integration with existing community systems
- Analytics and insights for event organizers

### Out of Scope (Initial Version)
- Event ticketing/payment processing
- Social features (comments, ratings, social sharing)
- Event registration management
- Integration with external calendar systems
- Commercial event promotion/advertising
- User-generated content beyond basic event details

## Assumptions

### Technical Assumptions
- Users have reliable smartphone access with internet connectivity
- Azure DevOps infrastructure can support development and deployment needs
- Basic web/mobile app development resources available

### Market Assumptions
- Current informal validation represents broader community need
- Event organizers will adopt new posting method if sufficiently simple
- Community members prefer digital discovery over current fragmented methods
- Success in 150-person village will translate to larger community adoption

### User Behavior Assumptions
- People will check app regularly for "what's happening now" queries
- Organizers will transition from paper posters/WhatsApp to app posting
- Progressive enhancement model (simple core + optional complexity) matches user preferences

## Risks and Mitigation

### High Risk
- **Adoption Failure**: Organizers don't post events consistently
  - *Mitigation*: Ultra-simple 5-step posting process, direct outreach to key organizers
- **Discovery Failure**: Users don't find the search effective
  - *Mitigation*: 3-step search constraint, user testing during development

### Medium Risk
- **Content Quality**: Incomplete or inaccurate event information
  - *Mitigation*: Progressive enhancement allows detail addition, community moderation
- **Technical Complexity**: Scaling from 150 to 50,000 users
  - *Mitigation*: Phased approach with architecture review at each scale milestone

### Low Risk
- **Competition**: Existing solutions improve
  - *Mitigation*: Focus on local community specificity and frictionless experience

## Next Steps

### Immediate Actions
1. **Requirements Collection**: Engage requirements-collector agent to gather detailed specifications
2. **MVP Definition**: Use mvp-specialist to prioritize features for village pilot
3. **Architecture Planning**: Design system architecture supporting progressive scale
4. **Azure DevOps Setup**: Initialize project tracking with azure-devops-planner agent

### Development Sequence
1. Project Initiator → Requirements Collector → MVP Specialist → Architect → Planner
2. Pseudo Coder → TDD Evidence Specialist → Coder → Documentation Writer
3. Git Mate for version control and deployment

### Success Validation
- Deploy to village pilot group
- Gather usage metrics and feedback
- Validate frictionless constraints (5-step posting, 3-step search)
- Document lessons learned for community expansion

## Stakeholders

### Primary Stakeholders
- **Village Community Members**: End users seeking and posting events
- **Project Development Team**: Using Azure DevOps Planner workflow
- **Local Event Organizers**: Key adoption group for content creation

### Secondary Stakeholders
- **Wider Community Leadership**: Future expansion decision makers
- **Technical Infrastructure Providers**: Supporting development and hosting

---

**Document Status**: Complete  
**Next Role**: Requirements Collector for detailed specification gathering  
**Azure DevOps Integration**: Ready for Epic creation and project tracking setup