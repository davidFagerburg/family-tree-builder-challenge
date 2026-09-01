WITH RECURSIVE family_tree AS (
  -- Anchor: Start directly with the child being evaluated
  SELECT id, parent_1_id, parent_2_id
  FROM People 
  WHERE id = :childId

  UNION ALL

  -- Recursive Step: Trace straight up the family tree
  SELECT p.id, p.parent_1_id, p.parent_2_id
  FROM People p
  JOIN family_tree ft ON p.id = ft.parent_1_id OR p.id = ft.parent_2_id
)
-- If this returns any rows, it means the parent is an ancestor of the child
SELECT id 
FROM family_tree 
WHERE id IN (:p1, :p2);