import db from "../config/db.js";

export const insertAnniversary = async ({
  pet_id,
  title,
  date,
  memo,
  image,
}) => {
  const result = await db.query(
    `INSERT INTO petsns.anniversaries (pet_id, title, date, memo, image)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [pet_id, title, date, memo, image]
  );
  return result.rows[0];
};

export const findAnniversariesByPet = async (petId) => {
  const result = await db.query(
    `SELECT * FROM petsns.anniversaries
     WHERE pet_id = $1
     ORDER BY date ASC`,
    [petId]
  );
  return result.rows;
};

export const removeAnniversary = async (id) => {
  const result = await db.query(
    `DELETE FROM petsns.anniversaries WHERE anniversary_id = $1`,
    [id]
  );
  return result.rowCount > 0;
};

export const findUpcomingAnniversaries = async () => {
  const result = await db.query(
    `SELECT * FROM "petsns"."anniversaries"
     WHERE date >= CURRENT_DATE
       AND date <= CURRENT_DATE + INTERVAL '7 days'
     ORDER BY date ASC`
  );
  return result.rows;
};
