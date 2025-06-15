# Bike rental application

**Prerequisites:**

- docker with **V2 docker compose** (should be able to run `docker compose` command instead of `docker-compose`, [reference](https://docs.docker.com/compose/releases/migrate/))

**How to run the application:**

- run `docker compose up --build` command in the root directory

**Access the application:**

- upon finishing building the application, you should be able to acces it via browser client under the following URL: `http://localhost:3000/`
- **IMPORTANT!** The client part is served using the same server, which is used for the API. That said, if you go to any other URL in the browser(e.g. `http://localhost:3000/auth`) directly, you will get an error `Can not GET http://localhost:3000/auth`. Please, always use this entrypoint: `http://localhost:3000/`
