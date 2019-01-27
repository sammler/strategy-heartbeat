_{%=name%}_ can be configured by the following environment variables:

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

