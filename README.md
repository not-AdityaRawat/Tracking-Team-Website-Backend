# T&P Tracker

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB Atlas
1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Update `.env` file with your MongoDB URI

### 3. Initial Data Sync
Run this command to populate the database with all company data:
```bash
npm run sync
```

This will:
- Fetch all 602 companies from the external API
- Store them in MongoDB Atlas
- Prevent duplicates (uses upsert)
- Show progress and statistics

### 4. Start the Backend Server
```bash
npm run dev
```

The server will run on http://localhost:3000

### 5. Run Monthly Sync (Optional)
To update the database with any new companies, run:
```bash
npm run sync
```

This is idempotent - it won't create duplicates. It will:
- Add new companies that don't exist
- Update existing companies if data has changed
- Skip companies with no changes

## API Endpoints

- `GET /data` - Get total count of companies
- `GET /companies?page=1&limit=20` - Get paginated companies
- `GET /placement?i=1` - Get single company by ID
- `POST /sync` - Manual sync trigger (alternative to npm run sync)

## Architecture

- **Backend**: Express.js with MongoDB/Mongoose
- **Database**: MongoDB Atlas (cloud)
- **Frontend**: React (fetches directly from backend/MongoDB)
- **No External API Dependency**: All data cached in MongoDB

## Benefits

✅ **No redundancy** - Uses `findOneAndUpdate` with upsert to prevent duplicates
✅ **Fast queries** - MongoDB indexed queries instead of 602 API calls
✅ **Monthly sync** - Just run `npm run sync` once per month
✅ **Offline capable** - Data persists in database
✅ **Scalable** - Pagination handled by MongoDB efficiently
