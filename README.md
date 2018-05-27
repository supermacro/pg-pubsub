# NodeJS + PG Pubsub Example

```
Who needs RabbitMQ? ;)
```

This repo implements a publish / subscribe system with zero dependancies (assuming you are already using postgres as your persistence layer + Node as your runtime).

## Requirements

[Docker](https://www.docker.com/); more specifically, the docker-compose cli ([link](https://docs.docker.com/compose/install/)), which I believe comes as part of the default Docker install.

You don't need to have PostgreSQL or NodeJS installed.


## How to run the app

1. **Build images**

```
> docker-compose up
```

2. **Run db migrations within the node docker container**

This requires you to execute an npm command from within the running node server docker container
```
> docker exec -it <server_container_name> bash

container_bash_session> npm run migrate
```

Note that the container name is most likely going to be `pg-pubsub_server_1`.

In the event that it is not, run `docker ps` to see the list of running containers on your machine. The name will appear under the right-most column called "NAMES"


3. Insert data into the `db_events` table

Option 1: **Make HTTP requests to port 8080**

Make a POST request to /users. Use postman or copy/paste the following curl command:

```
curl -X POST \
  http://localhost:8080/users \
  -H 'Content-Type: application/json' \
  -d '{
	"first_name": "Rick",
	"last_name": "Sanchez",
	"email": "burp@gmail.com",
	"cellphone": "+14169999999"
}'
```

Ensure you have `first_name`, `last_name`, `email`, `cellphone` in your request body ... I don't have validation set up on this server.


Option 2: **Make a direct insert into `db_events`**

```
INSERT INTO db_events (channel, payload)
VALUES ('sms', '{ "msg": "yoloooo!" }')
```

## Connecting to the db

Info can be found in the `Docker-compose.yml` file.

```
POSTGRES_USER: 'gio'
POSTGRES_PASSWORD: 'testing123'
POSTGRES_DB: 'my_db'
```

The db is exposed on port 15432.

## Structure

**Implementing the "Pub" in Pub / Sub**

The `migrations` folder contains the schemas / triggers / and SQL functions necessary to implement the publishing aspect of the system.

More specifically, there's a `db_events` table which stores messages sent into the pub sub system. Further, there is a trigger made that executes a sql function on any insertion into the `db_events`.


**Implementing the "Sub" in Pub / Sub**

Inside `src/services/client.ts`, I use the `pg` module to:

1. Connect to the db
2. Listen to "pub_sub" events being invoked from within postgres (which I've defined in the migrations)
3. Invoke any asynchronous functions associated with the various events that can occur in the system.

