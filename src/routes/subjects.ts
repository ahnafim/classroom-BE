import express from "express";
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {departments, subjects} from "../db/schema/app.js";
import {db} from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
                const { search, department, page = "1", limit = "10" } = req.query;
                const toPositiveInt = (v: unknown, fallback: number) => {
                        const n = Number(v);
                        return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
                    };
                const currentPage = toPositiveInt(page, 1);
                const limitPerPage = Math.min(toPositiveInt(limit, 10), 100);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`),
                )
            );
        }
        if (department) {
            const deptPattern = `%${String(department).replace(/[%_]/g, '\\$&')}%`;
            filterConditions.push(ilike(departments.name, deptPattern));
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions): undefined;

        const countResult = await db
            .select({count: sql<number>`count(*)`})
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count??0;

        const subjectsList = await db
            .select({
                ...getTableColumns(subjects), department: { ...getTableColumns(departments)
                }
            }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            }
            }

        )

    }catch(e){
        console.error(`GET/ subjects error:${e}`);
        res.status(500).json({error: 'Failed to load subjects'});
    }
})

export default router;