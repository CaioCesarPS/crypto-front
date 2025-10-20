# How to run

1- Install Docker with docker-compose support.

2- Create an account on [Supabase](https://supabase.com/) and create a new project.

2- Copy the `.env.example` to `.env.local` and fill in your Supabase credentials.

3- Run the following command to build and start the Docker container: `npm run docker:build:prod && npm run docker:prod`.

4- Open your browser and navigate to `http://localhost:3000` to see the application running.

# Features

1- Home and Favorites pages with a list of cryptocurrencies fetched from the CoinGecko API.

2- All the polish topics (Better loading states. smooth animations, Error states, Dark Mode toggle).

3- All the Advanced Features (Delete route with optimistic updates, Historical chart 7-days price, Search/ filter, Infinity scroll, Performance)

4- Almost all the Production Ready (Automated tests, Typescript strict any, Docker setup and CI/CD with deploy to Vercel)

# IA-Assisted Developement

- I used GH Copilot.
- I used the model Sonnet 4.5 to create the code and write tests.
- I created a custom prompt to guide the model to create better code for my needs.
- This full application in normal developement maybe took me around 1 day and 1/2 to develop, with the help of the IA I was able to create it in around 6h with almost the "Bonus Features".

# Notes

- The CoinGecko API has a rate limit so in certain point of scrolling down the page you may face an error 429 too many requests, just wait a minute and use again.