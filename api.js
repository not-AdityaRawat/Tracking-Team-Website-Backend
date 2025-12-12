import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Company from './models/Company.js';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors({
    origin: [
        'https://tracking-team.vercel.app',
        'https://tracking-team-website-frontend.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4173'
    ],
    credentials: true
}));

// Get total count from database
app.get("/data", async (req, res) => {
    try {
        const count = await Company.countDocuments();
        res.json({ count });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch count' });
    }
});

// Get company by ID
app.get("/placement", async (req, res) => {
    const { i } = req.query;
    try {
        const company = await Company.findOne({ id: parseInt(i) });
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.json(company);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch company data' });
    }
});

// Get paginated companies
app.get("/companies", async (req, res) => {
    const { page = 1, limit = 20, sortBy, sortOrder = 'asc', search } = req.query;
    try {
        // Build search filter
        let filter = {};
        if (search) {
            filter.Name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        
        let sortOptions = { id: 1 }; // Default sort by id
        
        if (sortBy) {
            const order = sortOrder === 'desc' ? -1 : 1;
            
            // Map sort fields
            switch(sortBy) {
                case 'Name':
                    sortOptions = { Name: order };
                    break;
                case 'CGPA':
                    sortOptions = { CGPA: order };
                    break;
                case 'Stipend':
                    sortOptions = { Stipend: order };
                    break;
                case 'Arrival Date':
                    sortOptions = { "Arrival Date": order };
                    break;
                case 'Type':
                    sortOptions = { Type: order };
                    break;
                case 'Coordinator':
                    // Sort with assigned coordinators first (non-empty strings), then empty ones
                    if (order === 1) {
                        // Ascending: Assigned first, then alphabetically
                        sortOptions = { 
                            Coordinator: { $ne: "" },
                            Coordinator: 1 
                        };
                    } else {
                        // Descending: Reverse alphabetically assigned, then unassigned
                        sortOptions = { Coordinator: -1 };
                    }
                    break;
                default:
                    sortOptions = { id: 1 };
            }
        }
        
        const companies = await Company.find(filter)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        
        const count = await Company.countDocuments(filter);
        
        res.json({
            companies,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

// Remove "Branches Allowed" field from all documents and add "Coordinator" field
// app.post("/migrate", async (req, res) => {
//     try {
//         const result = await Company.updateMany(
//             {},
//             { 
//                 $unset: { "Branches Allowed": "" },
//                 $set: { 
//                     Coordinator: "",
//                     Tracked: false,
//                     Invited: false,
//                     Called: false
//                 }
//             }
//         );
        
//         res.json({ 
//             message: "Migration complete",
//             modifiedCount: result.modifiedCount
//         });
//     } catch (error) {
//         console.error('Migration error:', error);
//         res.status(500).json({ error: 'Failed to migrate data' });
//     }
// });

// Update coordinator for a company
app.patch("/company/:id/coordinator", async (req, res) => {
    const { id } = req.params;
    const { coordinator } = req.body;
    
    try {
        const company = await Company.findOneAndUpdate(
            { id: parseInt(id) },
            { Coordinator: coordinator },
            { new: true }
        );
        
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        res.json({ message: 'Coordinator updated', company });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update coordinator' });
    }
});

// Create a new company
app.post("/company", async (req, res) => {
    try {
        const { Name, CGPA, Title, Stipend, Location, Type } = req.body;
        const StipendInfo = req.body['Stipend Info'];
        const JobTitle = req.body['Job Title'];
        const ArrivalDate = req.body['Arrival Date'];
        
        if (!Name || Name.trim() === "") {
            return res.status(400).json({ error: 'Company name is required' });
        }
        
        // Get the highest id and increment
        const lastCompany = await Company.findOne().sort({ id: -1 });
        const newId = lastCompany ? lastCompany.id + 1 : 1;
        
        const newCompany = await Company.create({
            id: newId,
            Name: Name.trim(),
            CGPA: CGPA || null,
            Title: Title || null,
            Stipend: Stipend || null,
            "Stipend Info": StipendInfo || null,
            Location: Location || null,
            "Job Title": JobTitle || null,
            Type: Type || null,
            "Arrival Date": ArrivalDate || null,
            Coordinator: "",
            Tracked: false,
            Invited: false,
            Called: false
        });
        
        res.status(201).json({ message: 'Company created successfully', company: newCompany });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ error: 'Failed to create company', details: error.message });
    }
});

// Update company status (Tracked, Invited, Called)
app.patch("/company/:id/status", async (req, res) => {
    const { id } = req.params;
    const { field, value } = req.body;
    
    try {
        const updateField = {};
        updateField[field] = value;
        
        const company = await Company.findOneAndUpdate(
            { id: parseInt(id) },
            updateField,
            { new: true }
        );
        
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        res.json({ message: 'Status updated', company });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Get coordinator performance stats
app.get("/coordinator-stats", async (req, res) => {
    try {
        const companies = await Company.find({ Coordinator: { $ne: "" } });
        
        const stats = {};
        companies.forEach(company => {
            if (!stats[company.Coordinator]) {
                stats[company.Coordinator] = {
                    coordinator: company.Coordinator,
                    total: 0,
                    tracked: 0,
                    invited: 0,
                    called: 0,
                    companies: []
                };
            }
            stats[company.Coordinator].total++;
            if (company.Tracked) stats[company.Coordinator].tracked++;
            if (company.Invited) stats[company.Coordinator].invited++;
            if (company.Called) stats[company.Coordinator].called++;
            stats[company.Coordinator].companies.push({
                id: company.id,
                name: company.Name,
                tracked: company.Tracked,
                invited: company.Invited,
                called: company.Called
            });
        });
        
        res.json(Object.values(stats));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch coordinator stats' });
    }
});

// Sync data from external API to MongoDB (run once to populate DB)
// app.post("/sync", async (req, res) => {
//     try {
//         console.log('Starting sync process...');
        
//         // Fetch total count
//         const countResponse = await fetch('https://iamalone.adminisalone.workers.dev/');
//         const countText = await countResponse.text();
//         const totalCount = parseInt(countText.trim());
        
//         console.log(`Total companies to sync: ${totalCount}`);
        
//         let synced = 0;
//         let updated = 0;
//         let created = 0;
        
//         // Fetch and store each company
//         for (let i = 1; i <= totalCount; i++) {
//             try {
//                 const response = await fetch(`https://iamalone.adminisalone.workers.dev/isadminalone/${i}`);
//                 const companyData = await response.json();
                
//                 const result = await Company.findOneAndUpdate(
//                     { id: i },
//                     { ...companyData, id: i },
//                     { upsert: true, new: true, setDefaultsOnInsert: true }
//                 );
                
//                 // Check if document was created or updated
//                 if (result.isNew) {
//                     created++;
//                 } else {
//                     updated++;
//                 }
                
//                 synced++;
//                 if (synced % 50 === 0) {
//                     console.log(`Progress: ${synced}/${totalCount} companies processed`);
//                 }
//             } catch (err) {
//                 console.error(`Error syncing company ${i}:`, err.message);
//             }
//         }
        
//         console.log(`Sync complete: ${synced} total, ${created} created, ${updated} updated`);
//         res.json({ 
//             message: `Successfully synced ${synced} companies`,
//             created,
//             updated,
//             total: synced
//         });
//     } catch (error) {
//         console.error('Sync error:', error);
//         res.status(500).json({ error: 'Failed to sync data' });
//     }
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
});