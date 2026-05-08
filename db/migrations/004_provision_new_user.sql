-- ============================================================
-- 004_provision_new_user.sql
-- M4 – Sprint 1 PR4: Auto-provision new users on Google OAuth
-- Fires on INSERT into auth.users (Supabase Auth)
-- Inserts USER / INACTIVE row into hr_user with VIEW-only rights
-- ============================================================

CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN

  -- Skip provisioning if the email is already in hr_user
  -- (covers seeded SUPERADMIN accounts logging in for the first time)
  IF EXISTS (SELECT 1 FROM public.hr_user WHERE email = NEW.email) THEN
    RETURN NEW;
  END IF;

  -- Insert new user as USER / INACTIVE
  INSERT INTO public.hr_user (userId, email, user_type, record_status, stamp)
  VALUES (
    NEW.id::text,
    NEW.email,
    'USER',
    'INACTIVE',
    'PENDING ' || NEW.email || ' ' || NOW()::text
  );

  -- Insert user_module rows for 4 HR modules (not Adm_Mod)
  INSERT INTO public.user_module (userId, moduleCode, rights_value)
  SELECT NEW.id::text, m.moduleCode, 0
  FROM public.module m
  WHERE m.moduleCode != 'Adm_Mod';

  -- Insert user_module_rights: VIEW rights = 1, everything else = 0
  INSERT INTO public.user_module_rights (userId, rightCode, right_value)
  SELECT NEW.id::text, r.rightCode,
    CASE
      WHEN r.rightCode IN ('EMP_VIEW', 'JH_VIEW', 'JOB_VIEW', 'DEPT_VIEW') THEN 1
      ELSE 0
    END
  FROM public.rights r
  WHERE r.moduleCode != 'Adm_Mod';

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION provision_new_user();
