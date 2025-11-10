UPDATE public.users
SET user_type = 'client'
WHERE email = 'jdterra@outlook.com';

DELETE FROM public.professionals
WHERE id = (
  SELECT id
  FROM public.users
  WHERE email = 'jdterra@outlook.com'
);

