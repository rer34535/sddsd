# Jafr Analysis Web Application

This is a Node.js web application that provides advanced Jafr (mystical numerology and astrology) analysis using the OpenRouter AI API.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- [Git](https://git-scm.com/) installed on your machine.
- An [OpenRouter API Key](https://openrouter.ai/).

## Running the Application Locally

1.  **Clone the repository (if applicable) and navigate to the project directory:**
    ```bash
    cd /path/to/your/project
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set the environment variable (optional for local use if you enter it in the UI):**
    -   For Windows (Command Prompt):
        ```cmd
        set OPENROUTER_API_KEY=your_api_key_here
        ```
    -   For Windows (PowerShell):
        ```powershell
        $env:OPENROUTER_API_KEY="your_api_key_here"
        ```
    -   For macOS/Linux:
        ```bash
        export OPENROUTER_API_KEY=your_api_key_here
        ```

4.  **Start the server:**
    ```bash
    npm start
    ```

5.  Open your browser and navigate to `http://localhost:3001`.

---

## Deployment to Heroku

Heroku is a platform that can host your Node.js application. Follow these steps to deploy your app.

### 1. Sign up and Install the Heroku CLI

-   Create a free account on [Heroku](https://signup.heroku.com/).
-   [Install the Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) on your machine.

### 2. Log in to Heroku

Open your terminal or command prompt and run the following command. This will open a browser window for you to log in.

```bash
heroku login
```

### 3. Initialize a Git Repository

If you haven't already, initialize a Git repository in your project folder.

```bash
cd /path/to/your/project
git init
git add .
git commit -m "Initial commit"
```

### 4. Create a Heroku Application

Run this command to create a new application on Heroku. It will also add a `heroku` remote to your Git configuration.

```bash
heroku create
```

Heroku will generate a random name for your app, or you can specify one: `heroku create your-app-name`.

### 5. Set the API Key Environment Variable

This is a critical step. You must set your `OPENROUTER_API_KEY` in the Heroku environment so your live application can access the AI service.

```bash
heroku config:set OPENROUTER_API_KEY=your_actual_openrouter_api_key
```

Replace `your_actual_openrouter_api_key` with your real key.

### 6. Deploy the Code

Push your code to the `heroku` remote. This will trigger the deployment process. Heroku will install your dependencies and start the server using the `npm start` command.

```bash
git push heroku main
```

*(Note: If your main branch is named `master`, use `git push heroku master` instead.)*

### 7. Open Your Application

Once the deployment is complete, you can open your live application in the browser with this command:

```bash
heroku open
```

Your Jafr analysis application is now live on the web!
