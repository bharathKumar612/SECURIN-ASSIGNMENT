# Backend

This project uses an Express.js backend that periodically updates its database by fetching data from an existing external database via Axios. The backend is designed to run scheduled tasks using cron jobs to ensure data remains up-to-date. A Docker container is used to host the database instance for this backend.

## Features

- **Express.js Framework:** Lightweight and efficient backend setup.
- **Axios for HTTP Requests:** Used to fetch data from an external database.
- **Cron Jobs:** Automated periodic data refresh from the external database.
- **Dockerized Database:** The backend database instance runs inside a Docker container for easy deployment and scalability.

## Technologies Used

- **Node.js**
- **Express.js**
- **Axios**
- **Cron (node-cron)**
- **Docker**

## Installation and Setup

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Docker](https://www.docker.com/)

### Steps to Run the Application

1. **Clone the repository:**

   ```sh
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the project root with the following variables:

   ```env
   DATABASE_URL=<your-database-url>
   PORT=<your-backend-port>
   ```

4. **Start the Docker container:**

   ```sh
   docker-compose up -d
   ```

5. **Run the application:**

   ```sh
   npm start
   ```

6. **Verify the server is running:**
   Open `http://localhost:3000` (or your configured port) in your browser or use Postman to test the endpoints.

## Project Structure

```
├───prisma
└───src
    ├───controllers
    ├───helpers
    └───routers
```

## Cron Job Functionality

- The cron jobs are scheduled based on the interval defined in the environment variable `CRON_SCHEDULE`.
- They fetch data from the external database API and update the local database.

## API Endpoints

| Method | Endpoint    | Description                    |
| ------ | ----------- | ------------------------------ |
| GET    | /cve/list   | Fetch current database records |
| POST   | /cve/:cveId | Manually trigger data refresh  |

# Frontend

# Frontend Project

This project is built using **React** with **TypeScript**, powered by **Vite** for a fast and optimized development experience. The UI is designed using **Tailwind CSS** and **shadcn**, providing a sleek and modern look. The frontend interacts with the backend using **Axios** to handle API calls.

## Features

- **React with TypeScript:** Ensures type safety and robust development.
- **Vite:** Fast build tool for optimized performance.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **shadcn:** Beautiful and customizable components for a modern UI.
- **Axios:** For making HTTP requests to the backend.
- **React Router:** For Routing the frontend.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd <project-directory>
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Project

To start the development server, run:

```bash
npm run dev
```

The project will be available at `http://localhost:5173/` by default.

## Project Structure

```
.
├───public
└───src
    ├───assets
    ├───components
    │   ├───pages
    │   └───ui
    ├───lib
    └───types
        └───responses
```

## Axios API Setup

Axios is used to handle API requests efficiently.

## ShadCN Components Usage

Used shadcn components to use reusable components that are already created by the team of shadcn.

## Scripts

- `npm run dev` - Start development server.
- `npm run build` - Build for production.
- `npm run lint` - Linting the codebase.

## Deployment

To build the project for production, run:

```bash
npm run build
```

The output will be available in the `dist` folder, ready to be deployed.

## Contact

For any queries, feel free to contact:

- **Name:** Monaram Bharath Kumar
- **Email:** bharathsolanki612@gmail.com
- **LinkedIn:** [Bharath Kumar](https://www.linkedin.com/in/bharath-kumar-13ab99224/)
- **GitHub:** [bharathKumar612](https://github.com/bharathKumar612)
