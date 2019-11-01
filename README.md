# Sick fits

My implementation of the Advanced React and GraphQL course by Wes Bos

You can see it live [here](https://leroy-sickfits-next-prod.herokuapp.com) or check out my certificate of completion on the course [here](https://drive.google.com/file/d/1uoqfU6mOSBew8OHuYAH_AZtpCUHHt-US/view?usp=sharing)

# What?

It's an electronic store project, featuring user (creation, update, permissions, authentication), item creation (deletion and edition), checkout (adding to cart, deleting from cart, purchase processing) and orders. 

# Frontend

Front end is built using Next.js, Styled Components, React-Apollo, Jest and Enzyme. As well as Apollo-Client to manage queries and mutations, caching and local state.

To locally run just run the commands inside package.json (npm i && npm run dev)

# Backend

Back end is built with Graphql Yoga (Nodejs+Express+Apollo-Server) for the queries and mutations resolvers, as well as the server side logic. Database is managed by Prisma

To locally run just run the commands inside package.json (npm i && npm run dev)
