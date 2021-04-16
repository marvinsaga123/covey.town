# Covey.Town CS4530 Final Project README

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life. This version was built on top of the Covey.Town repo built for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/).
You can view our reference deployment of the app at [peaceful-brattain-c5eb8c.netlify.app](https://peaceful-brattain-c5eb8c.netlify.app/).

## Deploying the App Locally

Access and clone the repository here: https://github.com/marvinsaga123/covey.town.

After cloning the repo, running the application locally entails running only running the **frontend** service (you'll be accessing the backend deployed at Heroku).

### Configuring the Frontend

Create a `.env` file in the `frontend` directory, with the line: `REACT_APP_TOWNS_SERVICE_URL=https://covey-town-final-project.herokuapp.com/`. This will ensure that the frontend running locally will be able to communicate with the rooms / town service deployed to Heroku.

## Starting Up the App

### Running the Frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally. The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory. You should now be able to register, login, and interact with the new features implemented as part of this iteration of Covey.Town.
