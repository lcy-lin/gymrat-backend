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
              LEFT JOIN acts_tags at ON a.id = at.act_id
              LEFT JOIN tags t ON at.tag_id = t.id
              WHERE a.user_id = ?
              GROUP BY a.id
            `;
            queryParams = [userId];
          } else {
            query = `
                SELECT a.*, DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS created_at, GROUP_CONCAT(t.name) AS tags
                FROM activities a
                LEFT JOIN acts_tags at ON a.id = at.act_id
                LEFT JOIN tags t ON at.tag_id = t.id
                WHERE a.user_id = ? AND t.name = ?
                GROUP BY a.id
                `;
            queryParams = [userId, category];
          }
          const [results] = await config.db.query(query, queryParams);
          return results.map((result) => ({
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
                SELECT a.*, DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS created_at, GROUP_CONCAT(t.name) AS tags
                FROM activities a
                LEFT JOIN acts_tags at ON a.id = at.act_id
                LEFT JOIN tags t ON at.tag_id = t.id
                WHERE a.id = ?
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
    // static async getMovementsAndSetsByActId(actId) {
    //     try {
    //         const query = `
    //             SELECT m.*, s.set_num, s.reps_achieved, s.str_left
    //             FROM movements m
    //             LEFT JOIN sets s ON m.id = s.mov_id
    //             WHERE m.act_id = ?
    //         `;
    //         const [results] = await config.db.query(query, [actId]);
    
    //         if (results.length === 0) {
    //             return { success: false, error: 'No movements and sets found for the given activity ID' };
    //         }
    
    //         const movements = results.map((result) => {
    //             const { set_num, reps_achieved, str_left, ...movementDetails } = result;
    //             return {
    //                 ...movementDetails,
    //                 sets: {
    //                     set_num,
    //                     reps_achieved,
    //                     str_left,
    //                 },
    //             };
    //         });
    
    //         return {
    //             success: true,
    //             movements,
    //         };
    //     } catch (error) {
    //         console.error(error);
    //         return { success: false, error: 'Error retrieving movements and sets by activity ID' };
    //     }
    // }
    static async getMovementsAndSetsByActId(actId) {
        try {
            const query = `
                SELECT m.id as movement_id, m.act_id, m.name, m.num_of_sets, m.reps_goal, m.weight, m.description,
                       s.set_num, s.reps_achieved, s.str_left
                FROM movements m
                LEFT JOIN sets s ON m.id = s.mov_id
                WHERE m.act_id = ?
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
    
    
    
}
export default ActModel;