# Affluent Scraper

Simple program to scrape some specific data from affluent dev website, and store the results to a temporary docker database.

## Dependencies

- `mysql-5.7`
- `node 12.19.1`
- `yarn 1.22.4`
- `Docker Desktop 2.5.0.1`

## Running the project

### Local/Dev environment

In order to execute this program locally, you need to create a local mysql database called `scraper_db` with a user `root` with password `root`, and run the following commands:

Clone the project

```sh
git clone https://github.com/kennasoft/affluent-scraper.git

cd affluent-scraper
```

Install node dependencies

```sh
yarn install
```

Start project in dev mode (with typescript debugging)

```sh
yarn dev
```

Once execution is done, verify your data was stored, by running the following commands

```sh
mysql -uroot -proot
```

```sql
select * from scrape_data;
```

### Docker

To execute this project locally in a docker container, you can run the following commands after cloning the project and setting the project directory as your working directory:

```sh
docker-compose build

docker-compose up --detach
```

```sh
mysql -uroot -proot
```

```sql
select * from scrape_data;
```
