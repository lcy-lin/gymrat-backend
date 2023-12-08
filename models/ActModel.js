import config from "../config.js";
class ActModel {
    static async insertAct(user_id, description, publicity) {
        try {
            const [insertResult] = await config.db.query(
                'INSERT INTO activities (user_id, description, publicity) VALUES (?, ?, ?)',
                [user_id, description, publicity]
            );
            return insertResult.insertId;
        }
        catch (error) {
            console.error(error);
            return { success: false, error: 'Error inserting activity' };
        }
        

    }
    static async insertTags(tags, activityId) {
        try {
            await Promise.all(tags.map(async (tag) => {
                
                const [tagResult] = await config.db.query(
                    'SELECT id FROM tags WHERE name = ?',
                    [tag]
                );
                const tagId = tagResult[0].id;
                await config.db.query(
                    'INSERT INTO acts_tags (act_id, tag_id) VALUES (?, ?)',
                    [activityId, tagId]
                );
                
            }));

            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error inserting tags' };
        }
    }
    static async insertMovements(movements, actId) {
        try {
            await Promise.all(movements.map(async (movement) => {
                const [movementResult] = await config.db.query(
                    'INSERT INTO movements (act_id, name, num_of_sets, reps_goal, weight, description) VALUES (?, ?, ?, ?, ?, ?)',
                    [actId, movement.name, movement.num_of_sets, movement.rep_goal, movement.weight, movement.description]
                );
    
                const movementId = movementResult.insertId;
    
                await Promise.all(movement.sets.map(async (set) => {
                    if (set.set_num === null || set.reps_achieved === null || set.str_left === null) {
                        throw new Error('Invalid set properties');
                    }
                    await config.db.query(
                        'INSERT INTO sets (mov_id, set_num, reps_achieved, str_left) VALUES (?, ? , ?, ?)',
                        [movementId, set.set_num, set.reps_achieved, set.str_left]
                    );
                }));
            }));
            return { success: true , actId: actId };
        }
        catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    }
    static async getActByUserId(category, userId) {
        try {
          let query;
          let queryParams;
    
          if (category.toLowerCase() === 'all') {
            query = `
              SELECT a.*, DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS created_at, GROUP_CONCAT(t.name) AS tags
              FROM activities a
              LEFT JOIN acts_tags at ON a.id = at.act_id AND at.soft_delete = 0
              LEFT JOIN tags t ON at.tag_id = t.id
              WHERE a.user_id = ? AND a.soft_delete = 0
              GROUP BY a.id
            `;
            queryParams = [userId];
          } else {
            query = `
                SELECT a.*, DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS created_at, GROUP_CONCAT(t.name) AS tags
                FROM activities a
                LEFT JOIN acts_tags at ON a.id = at.act_id AND at.soft_delete = 0
                LEFT JOIN tags t ON at.tag_id = t.id
                WHERE a.user_id = ? AND t.name = ? AND a.soft_delete = 0
                GROUP BY a.id
                `;
            queryParams = [userId, category];
          }
          const [results] = await config.db.query(query, queryParams);
          return results.map(({ soft_delete, ...result }) => ({
            ...result,
            tags: result.tags ? result.tags.split(',') : [],
            }));
        } catch (error) {
          console.error(error);
          return { success: false, error: 'Error retrieving activities' };
        }
    }
    static async getActByActId(actId) {
        try {
            const query = `
                SELECT a.id, a.user_id, a.description, a.publicity, DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS created_at, GROUP_CONCAT(t.name) AS tags
                FROM activities a
                LEFT JOIN acts_tags at ON a.id = at.act_id AND at.soft_delete = 0
                LEFT JOIN tags t ON at.tag_id = t.id
                WHERE a.id = ? AND a.soft_delete = 0
                GROUP BY a.id
            `;

            const [results] = await config.db.query(query, [actId]);
    
            if (results.length === 0) {
                return { success: false, error: 'Activity not found' };
            }
    
            const result = results[0];
            return {
                success: true,
                activity: {
                    ...result,
                    tags: result.tags ? result.tags.split(',') : [],
                },
            };
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error retrieving activity by ID' };
        }
    }
    static async getMovementsAndSetsByActId(actId) {
        try {
            const query = `
                SELECT m.id as movement_id, m.act_id, m.name, m.num_of_sets, m.reps_goal, m.weight, m.description,
                    s.set_num, s.reps_achieved, s.str_left
                FROM movements m
                LEFT JOIN sets s ON m.id = s.mov_id
                WHERE m.act_id = ? AND m.soft_delete = 0 AND (s.soft_delete = 0)
            `;

            const [results] = await config.db.query(query, [actId]);
    
            if (results.length === 0) {
                return { success: false, error: 'No movements and sets found for the given activity ID' };
            }
    
            const movementsMap = new Map();
    
            results.forEach((result) => {
                const { movement_id, act_id, name, num_of_sets, reps_goal, weight, description, set_num, reps_achieved, str_left } = result;
    
                if (!movementsMap.has(movement_id)) {
                    movementsMap.set(movement_id, {
                        id: movement_id,
                        name,
                        num_of_sets,
                        reps_goal,
                        weight,
                        description,
                        sets: [],
                    });
                }
    
                movementsMap.get(movement_id).sets.push({
                    set_num,
                    reps_achieved,
                    str_left,
                });
            });
    
            const movements = Array.from(movementsMap.values());
    
            return {
                success: true,
                movements,
            };
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error retrieving movements and sets by activity ID' };
        }
    }
    static async getActRecordsByUser(userId, year) {
        try {
          const monthsList = Array.from({ length: 12 }, (_, i) => i + 1);
          const unionAll = monthsList.map((month) => `SELECT ${month} AS month`).join('\nUNION ALL\n');
      
          const query = `
            SELECT
              m.month AS activity_month,
              COUNT(a.id) AS activity_count
            FROM (
              ${unionAll}
            ) m
            LEFT JOIN activities a ON MONTH(a.created_at) = m.month AND YEAR(a.created_at) = ?
                                   AND a.user_id = ? AND a.soft_delete = 0
            GROUP BY m.month
          `;
      
          const values = [year, userId];
      
          const [results] = await config.db.query(query, values);
      
          return { success: true, records: results, year: year };
        } catch (error) {
          console.error(error);
          return { success: false, error: 'Database error' };
        }
      }
      

    static async updateActivity(actId, updatedData) {
        try {
            const { tags, movements, ...updatedActivityData } = updatedData;
    
            await config.db.query('UPDATE activities SET ? WHERE id = ?', [updatedActivityData, actId]);
    
            const updateTagsRes = await ActModel.updateTags(tags, actId);
            if (!updateTagsRes.success) {
                throw new Error(updateTagsRes.error);
            }
    
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error updating activity' };
        }
    }
    

    static async updateTags(tags, actId) {
        try {
            const [existingTags] = await config.db.query('SELECT tag_id FROM acts_tags WHERE act_id = ?', [actId]);
            const existingTagIds = existingTags.map((tag) => tag.tag_id);
            let tagIds = [];

            await Promise.all(tags.map(async (tag) => {
                const [tagResult] = await config.db.query(
                    'SELECT id FROM tags WHERE name = ?',
                    [tag]
                );
    
                if (tagResult.length > 0) {
                    const tagId = tagResult[0].id;
                    tagIds.push(tagId);
                    console.log(tagIds);
                    if (existingTagIds.includes(tagId)) {
                        await config.db.query('UPDATE acts_tags SET tag_id = ?, soft_delete = ? WHERE act_id = ? AND tag_id = ?', [tagId, 0, actId, tagId]);
                    } else {
                        await config.db.query('INSERT INTO acts_tags (act_id, tag_id) VALUES (?, ?)', [actId, tagId]);
                    }
                }
            }));
            const tagsToDelete = existingTagIds.filter((tagId) => !tagIds.includes(tagId));
            console.log(tagsToDelete);
            await Promise.all(tagsToDelete.map(async (tagId) => {
                await config.db.query('UPDATE acts_tags SET soft_delete = 1 WHERE act_id = ? AND tag_id = ?', [actId, tagId]);
            }));
    
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error updating tags' };
        }
    }
    

    static async updateMovementsAndSets(movements, actId) {
        try {
            const [existingMovements] = await config.db.query('SELECT id FROM movements WHERE act_id = ?', [actId]);
            const existingMovementIds = existingMovements.map((movement) => movement.id);
            await Promise.all(movements.map(async (movement) => {
                if (movement.id && existingMovementIds.includes(movement.id)) {
                    await config.db.query(
                        'UPDATE movements SET name = ?, num_of_sets = ?, reps_goal = ?, weight = ?, description = ?, soft_delete = ? WHERE id = ?',
                        [movement.name, movement.num_of_sets, movement.reps_goal, movement.weight, movement.description, 0, movement.id]
                    );
    
                    const [existingSets] = await config.db.query('SELECT * FROM sets WHERE mov_id = ?', [movement.id]);
                    const existingSetNums = existingSets.map((set) => set.set_num);
                    await Promise.all(movement.sets.map(async (set) => {
                        if (set.set_num && existingSetNums.includes(set.set_num)) {
                            await config.db.query(
                                'UPDATE sets SET reps_achieved = ?, str_left = ?, soft_delete = ? WHERE mov_id = ? AND set_num = ?',
                                [set.reps_achieved, set.str_left, 0, movement.id, set.set_num]
                            );
                        } 
                        else {
                            await config.db.query(
                                'INSERT INTO sets (mov_id, set_num, reps_achieved, soft_delete, str_left) VALUES (?, ?, ?, ?, ?)',
                                [movement.id, set.set_num, set.reps_achieved, 0, set.str_left]
                            );
                        }
                    }));
                    // ---------------------- DELETE ----------------------
                    const deletedSets = existingSets.filter((set) => !movement.sets.some((setInRequest) => setInRequest.set_num === set.set_num));
                    await Promise.all(deletedSets.map(async (set) => {
                        await config.db.query('UPDATE sets SET soft_delete = 1 WHERE set_num = ? AND mov_id = ?', [set.set_num, movement.id]);
                    }));
                    const deletedMovements = existingMovements.filter((existingMovement) => !movements.some((movementInRequest) => movementInRequest.id === existingMovement.id));
                    await Promise.all(deletedMovements.map(async (existingMovement) => {
                        await config.db.query('UPDATE movements SET soft_delete = 1 WHERE id = ?', [existingMovement.id]);
                    }));
                    // ---------------------- DELETE ----------------------
                } else {
                    const [movementResult] = await config.db.query(
                        'INSERT INTO movements (act_id, name, num_of_sets, reps_goal, weight, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [actId, movement.name, movement.num_of_sets, movement.reps_goal, movement.weight, movement.description]
                    );
                    
    
                    const movementId = movementResult.insertId;
    
                    await Promise.all(movement.sets.map(async (set) => {
                        if (set.set_num === null || set.reps_achieved === null || set.str_left === null) {
                            throw new Error('Invalid set properties');
                        }
    
                        await config.db.query(
                            'INSERT INTO sets (mov_id, set_num, reps_achieved, str_left) VALUES (?, ?, ?, ?)',
                            [movementId, set.set_num, set.reps_achieved, set.str_left]
                        );
                    }));
                }
            }));
    
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error updating movements and sets' };
        }
    }
    static async deleteActivity(actId) {
        try {
            await config.db.query('UPDATE activities SET soft_delete = 1 WHERE id = ?', [actId]);
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error deleting activity' };
        }
    }
    
}
export default ActModel;