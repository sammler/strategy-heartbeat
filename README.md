# strategy-heartbeat

> Basic heartbeat service (as a sammler strategy).

[![CircleCI](https://img.shields.io/circleci/project/github/sammler/strategy-heartbeat.svg)](https://circleci.com/gh/sammler/strategy-heartbeat)
[![Codecov](https://img.shields.io/codecov/c/github/sammler/strategy-heartbeat.svg?logo=codecov)](https://codecov.io/gh/sammler/strategy-heartbeat)

---

## Purpose

_strategy-heartbeat_ is basically a super boring and useless service.

All it does is:

- Providing an API to store settings.
- Listen to nats for `HeartBeatRequests` (per user)
  - And then store a `HeartBeatResponse`
  - To be exposed again by the API
- So, bottom line we could also describe this service as a ping-pong service
  
## If this is pretty much useless, why do we need it?

In its final state, _strategy-heartbeat_ is meant to be a reference implementation of a _strategy_ in sammler.io, implementing patterns such as:

- Configuration
- API exposure
- Loosely coupled/event-driven architecture using a message-bus such as nats.io
- Logging
- Error Handling
- Handling scheduled per-user data collection operations
- Authentication
- Role based access control
- Testing
- CircleCI integration
- Development environment
- etc.

As this is a node.js service, it is planned to create a similar [reference implementation for Go](https://github.com/sammler/strategy-uptime).
Future change to how to handle the different patterns - following best practices and trying out new technologies - will be implemented in this service first.

## Installation

```sh
$ docker pull sammlerio/strategy-heartbeat
```

## Usage

See [docker-compose.yml](./docker-compose.yml) file.

### Configuration

_strategy-heartbeat_ can be configured by the following environment variables:

**General:**

- `PORT` - The port to run the REST API (defaults to `3101`).
- `JWT_SECRET` - The secret used for JWT.

**MongoDB:**

- `MONGODB_DEBUG` - Whether to use the Mongoose debug mode or not, defaults to `false`.
- `MONGODB_HOST` - MongoDB host, defaults to `localhost`.
- `MONGODB_PORT` - MongoDB port, defaults to `27017`. 
- `MONGODB_DATABASE` - The MongoDB database, defaults to `sammlerio`.

**NATS-Streaming:**

- `NATS_STREAMING_HOST` - The host of the nats-streaming server, defaults to `localhost`.
- `NATS_STREAMING_PORT` - The port of the nats-streaming server, defaults to `4222`.

**Resources:**
- `JOBS_SERVICE_URI` - The URI for the _jobs-service_, defaults to `http://localhost:3003`.

**Behavior of the service:**

- `ENABLE_AUDIT_LOG` - Whether to enable the audit log or not, can be `true` or `false`, defaults to `true`.

## Author
**Stefan Walther**

* [twitter](http://twitter.com/waltherstefan)
* [github.com/stefanwalther](http://github.com/stefanwalther)
* [LinkedIn](https://www.linkedin.com/in/stefanwalther/)

## License
MIT

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on January 27, 2019._

