-- ============================================================================
-- Huawei Events — sample seed data
-- Run after supabase/schema.sql. Timestamps are relative to "now".
-- ============================================================================

insert into public.events (
  title, slug, tagline, description, cover_image_url, venue, city,
  start_time, end_time, capacity, price, organizer, category, status
) values
(
  'Build with AI Bootcamp',
  'build-with-ai-bootcamp-7k2q',
  'Hands-on intro to building AI-powered apps for total beginners.',
  E'Join us for a full-day, hands-on bootcamp where you will learn how to ship your first AI-powered application from scratch. No prior AI experience needed — just bring your laptop and curiosity.\n\nWhat you will learn:\n- How large language models work under the hood\n- Prompting, RAG and agent basics\n- Building and deploying a real app with an AI API\n- Best practices for responsible AI\n\nLimited seats available. Free for Huawei members.',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  'Huawei Innovation Lab',
  'Minna',
  now() + interval '7 days',
  now() + interval '7 days' + interval '6 hours',
  60, 0, 'Huawei', 'Bootcamp', 'published'
),
(
  'Huawei Hackathon 2026',
  'huawei-hackathon-2026-x8mz',
  '48 hours. One problem. Build something that matters.',
  E'Our flagship hackathon returns. Form a team of up to four, pick a challenge from one of our sponsor tracks, and build a working prototype in 48 hours.\n\nPrizes:\n- 1st place: N500,000\n- 2nd place: N300,000\n- 3rd place: N150,000\n- Best use of AI: N100,000\n\nRegistration is free but you must register to participate. Teams that register individually will be matched on day one.',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  'Huawei Innovation Lab',
  'Minna',
  now() + interval '21 days',
  now() + interval '23 days',
  150, 0, 'Huawei', 'Hackathon', 'published'
),
(
  'Web Development 101: React Fundamentals',
  'web-dev-101-react-fundamentals-3rn6',
  'A gentle weekend intro to modern web development with React.',
  E'Ever wanted to build websites that people actually use? This workshop walks you through the modern web stack — HTML, CSS, JavaScript and React — in a relaxed, practical setting.\n\nBring a laptop. Lunch and refreshments provided.',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
  'Huawei Training Room 2',
  'Minna',
  now() + interval '14 days' + interval '9 hours',
  now() + interval '14 days' + interval '17 hours',
  40, 0, 'Huawei', 'Workshop', 'published'
),
(
  'Product Design Sprint: From Idea to Prototype',
  'product-design-sprint-6dmh',
  'Learn the design process used by top startups — in one weekend.',
  E'A two-day design sprint where you will take a raw idea through research, wireframes and a clickable prototype using Figma. Perfect for product designers, developers and founders.\n\nYou do not need design experience — just an idea you want to bring to life.',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  'Huawei Co-working Space',
  'Minna',
  now() + interval '28 days' + interval '10 hours',
  now() + interval '29 days' + interval '18 hours',
  30, 0, 'Huawei', 'Workshop', 'published'
),
(
  'Git & Open Source Night',
  'git-open-source-night-9bjk',
  'Make your first open source contribution before the night is over.',
  E'A relaxed evening for beginners to learn Git and GitHub, understand what open source is, and make a real first contribution to a beginner-friendly project.\n\nNo sign-up friction — just show up with a laptop and your GitHub account.',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'Huawei Innovation Lab',
  'Minna',
  now() + interval '10 days' + interval '17 hours',
  now() + interval '10 days' + interval '20 hours',
  null, 0, 'Huawei', 'Meetup', 'published'
),
(
  'Career Talks: Building a Portfolio That Gets You Hired',
  'career-talks-portfolio-hired-v2fk',
  'A fireside chat with engineers who have interviewed at top tech companies.',
  E'What actually gets you hired as a fresh graduate in tech? Hear from a panel of engineers who have been on both sides of the interview table. Bring your questions.\n\nLight snacks available after the session.',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
  'Huawei Auditorium',
  'Minna',
  now() + interval '5 days' + interval '16 hours',
  now() + interval '5 days' + interval '18 hours',
  100, 0, 'Huawei', 'Talk', 'published'
);
