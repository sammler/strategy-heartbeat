_{%= name%}_ is basically a super boring and useless service.

All it does is:

- Providing an API to store settings.
- Listen to nats for `HeartBeatRequests` (per user)
  - And then store a `HeartBeatResponse`
  - To be exposed again by the API
- So, bottom line we could also describe this service as a ping-pong service
  
## If this is pretty much useless, why do we need it?

In its final state, _{%= name%}_ is meant to be a reference implementation of a _strategy_ in sammler.io, implementing patterns such as:

- API exposure
- Loosely coupled/event-driven architecture using a message-bus such as nats.io
- Logging
- Error Handling
- Handling scheduled per-user data collection operations
- Authentication
- Role based access control
- etc.

As this is a node.js service, it is planned to create a similar [reference implementation for Go](https://github.com/sammler/strategy-uptime).
Future change to how to handle the different patterns - following best practices and trying out new technologies - will be implemented in this service first.
