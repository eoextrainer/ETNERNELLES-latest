# ETERNELLES

## Deploy (Render)

- Use the Render blueprint in render.yaml to create the backend and frontend.
- Set the environment variables listed in RENDER_DEPLOYMENT_GUIDE.md.
- After the backend is live, seed the database using the backend seed script with DATABASE_URL set to your Render database.

See RENDER_DEPLOYMENT_GUIDE.md for the full walkthrough.

### Local Render deploy automation

Create a local env file (not committed) at .render-deploy.env with these keys:

- RENDER_DATABASE_URL
- RENDER_BACKEND_DEPLOY_HOOK
- RENDER_FRONTEND_DEPLOY_HOOK

Load the environment in any shell:

- source scripts/load_render_env.sh

To make it persistent across shells, add this line to your ~/.bashrc:

- source /path/to/ETERNELLES/.render-deploy.env

One-command workflow (save + tag + push + deploy DB/backend/frontend):

- bash scripts/deploy_render_full.sh "Stable release" stable-YYYYMMDD-HHMM