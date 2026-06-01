# SentinelFi DeFi Guardian

SentinelFi is an AI-powered DeFi position guardian built for the Injective Protocol. It monitors perpetual positions, provides AI-driven health analysis, and executes automated guardrail rules to protect and manage your DeFi strategies effectively.

## Features
- **AI-Driven Health Analysis**: Intelligent insights on your positions using LLMs.
- **Automated Guardrail Rules**: Execute tailored rules (stop-loss, take-profit, dynamic rebalancing, etc.).
- **Injective Protocol Integration**: Direct integration via `@injectivelabs/sdk-ts`.
- **Modern Dashboard**: Built with Next.js 14, React 19, Tailwind CSS, and Shadcn UI.
- **Local Persistence**: Data stored with `better-sqlite3`.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sentinelfi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and fill in your keys:
   ```bash
   cp .env.example .env.local
   # Ensure you configure your Injective credentials and LLM API keys.
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Deployment on Vercel

If you cannot see the app on your Vercel dashboard:
1. Ensure your local repository is pushed to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **Add New... > Project**.
3. Import the corresponding GitHub repository.
4. Ensure the Framework Preset is explicitly set to **Next.js**.
5. Provide your Environment Variables (from `.env.local`).
6. Click **Deploy**.

*Note: Since the app initially uses `better-sqlite3` for local persistence, deploying on edge environments like Vercel will require migrating to a standard Postgres/MySQL database (e.g., Vercel Postgres, Supabase) for production persistence.*

## Contributing
Contributions and feature requests are welcome! Feel free to open an issue or submit a pull request.
