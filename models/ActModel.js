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
                    await config.db.query(
                        'INSERT INTO sets (mov_id, reps_achieved, str_left) VALUES (?, ?, ?)',
                        [movementId, set.reps_achieved, set.str_left]
                    );
                }));
            }));
            return { success: true , actId: actId };
        }
        catch (error) {
            console.error(error);
            return { success: false, error: 'Error inserting movements' };
        }
    }
}
export default ActModel;