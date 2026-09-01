WITH RECURSIVE family_tree AS (
  -- Anchor: Start directly with the prospective parents being assigned
  SELECT id, parent_1_id, parent_2_id
  FROM People 
  WHERE id IN (:p1, :p2)

  UNION ALL

  -- Recursive Step: Trace straight up the family tree toward older generations
  SELECT p.id, p.parent_1_id, p.parent_2_id
  FROM People p
  JOIN family_tree ft ON p.id = ft.parent_1_id OR p.id = ft.parent_2_id
)
-- If the target child's ID appears anywhere in their parents' ancestral line, a loop is found
SELECT id 
FROM family_tree 
WHERE id = :childId;
