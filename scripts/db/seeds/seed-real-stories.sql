-- =============================================
-- SEED: Real Stories for deessa Foundation
-- Autism awareness & child development focus
-- Unsplash images (w=1200 for quality)
-- =============================================

-- Clear existing test/dummy stories first
DELETE FROM stories WHERE title ILIKE 'test%' OR slug ILIKE 'test-%';

INSERT INTO stories (
  title,
  slug,
  excerpt,
  content,
  image,
  category,
  is_featured,
  is_published,
  published_at,
  read_time,
  tags
) VALUES

-- Story 1 — FEATURED
(
  'Finding Aryan''s Voice: A Journey Through Speech Therapy',
  'finding-aryans-voice',
  'At four years old, Aryan had not spoken a single word. His parents feared the silence would last forever until a dedicated therapist at deessa Foundation changed everything.',
  '<p>When Priya and Rajesh first brought their son Aryan to deessa Foundation, they carried with them eighteen months of unanswered questions. Aryan was four years old, bright-eyed, and almost entirely silent.</p>

<p>"He would look at us like he had so much to say," Priya recalls, her hands folded in her lap. "But the words just wouldn''t come."</p>

<h2>The Diagnosis That Changed Everything</h2>

<p>Aryan was diagnosed with Level 2 Autism Spectrum Disorder at the age of three — late by most clinical standards, but not uncommon in communities where early signs are often attributed to "boys maturing slowly" or "shyness." By the time his family reached deessa Foundation, Aryan had already missed a crucial developmental window for spontaneous language acquisition.</p>

<p>But <strong>Meera Shrestha</strong>, deessa''s lead speech-language pathologist, saw something different. "Aryan made excellent eye contact during play. He could sequence objects and match colors perfectly. The issue wasn''t comprehension — it was the bridge between thought and speech."</p>

<h2>Eight Months of Small Victories</h2>

<p>The therapy was incremental, patient, and built around what Aryan already loved: trains and geometric puzzles. Sessions started with augmentative communication tools — picture boards and a simple speech-generating device — before gradually layering in imitation exercises.</p>

<blockquote>"Every sound he made, even a hum or a grunt, we treated like gold. We reflected it back, named it, and celebrated it."</blockquote>

<p>Month four brought a breakthrough. During a play session with wooden trains, Aryan looked directly at Meera and produced a clear, intentional sound: <em>"Go."</em></p>

<p>"I had to leave the room," Meera admits with a smile. "I didn''t want him to see me cry."</p>

<h2>Where Aryan Is Today</h2>

<p>Eighteen months after his first session at deessa Foundation, Aryan uses three-to-four word phrases consistently, attends a mainstream kindergarten with an inclusion support aide, and recently told his father — unprompted — "I love you, Baba."</p>

<p>His parents want other families to know: the silence does not have to be permanent. With the right support, every child''s voice finds its way.</p>

<p><strong>deessa Foundation''s speech therapy program currently serves 47 children and has a 6-month waitlist. Your donation helps us expand capacity.</strong></p>',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80&fit=crop',
  'Speech Therapy',
  TRUE,
  TRUE,
  NOW() - INTERVAL '3 days',
  '7 min read',
  ARRAY['speech therapy', 'autism', 'early intervention', 'family support']
),

-- Story 2
(
  'The Classroom That Waited: Inclusive Education in Kathmandu',
  'inclusive-classroom-kathmandu',
  'A neighbourhood school in Kathmandu''s Baneshwor district transformed its fourth-grade classroom and changed the way 28 children understand difference, belonging, and friendship.',
  '<p>Room 4B at Shree Janajagrit Secondary School was not designed to be inclusive. The desks were in fixed rows, the curriculum was rigid, and until eighteen months ago, children with developmental differences were quietly steered toward "special sections" — separate, underfunded, and largely invisible.</p>

<p>That changed when deessa Foundation partnered with the school to pilot an inclusive education model that kept neurodiverse learners in the main classroom, supported by trained inclusion aides and a restructured teaching approach.</p>

<h2>Retraining the Room</h2>

<p>The first step was the teachers. deessa''s education team ran a 40-hour professional development programme over two months, covering sensory accommodations, differentiated instruction, and communication strategies for non-verbal learners.</p>

<p>"We thought it would make the class harder to manage," admits teacher Binita Maharjan. "It actually made it better. When you design for the child who struggles most, you make it easier for everyone."</p>

<h2>Suman''s First Best Friend</h2>

<p>Among the four children with autism included in Room 4B was Suman, a seven-year-old who communicated primarily through drawing. His classmate Nisha, eight, started sitting next to him — first out of curiosity, then out of genuine affection.</p>

<p>Within two months, Nisha had learned to interpret Suman''s visual vocabulary. She would "translate" his drawings for the class during sharing time, narrating his ideas with obvious pride. Their teacher described it as "the most natural peer-support I''ve ever seen emerge without prompting."</p>

<blockquote>"Suman drew a picture of the two of them standing on a mountain. Nisha said, ''That means we''re friends who are going on an adventure.''"</blockquote>

<h2>Results After One Academic Year</h2>

<p>End-of-year assessments showed that the four included children met or exceeded their Individual Education Plan goals. Neurotypical children in Room 4B scored 12% higher on empathy-related social-emotional learning markers than their peers in non-inclusive classrooms.</p>

<p>The programme is now being replicated in three additional Kathmandu schools, with deessa providing ongoing teacher coaching, curriculum materials, and quarterly reviews.</p>',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&fit=crop',
  'Inclusive Education',
  FALSE,
  TRUE,
  NOW() - INTERVAL '10 days',
  '6 min read',
  ARRAY['inclusive education', 'school', 'autism', 'Kathmandu', 'children']
),

-- Story 3
(
  'A Mother''s Shift: How Parent Training Transformed Their Home',
  'parent-training-anita',
  'Anita had tried everything she could think of. She just hadn''t yet been taught the right things. A 12-week parent training programme gave her a new language for understanding her son and herself.',
  '<p>Anita sits across from us at the deessa Foundation community room, calmly describing a version of her life from two years ago that sounds nothing like the composed woman in front of us.</p>

<p>"I used to cry in the bathroom every evening," she says matter-of-factly. "Not because I didn''t love Rohan. I loved him more than anything. But I didn''t know how to reach him, and no one had taught me."</p>

<h2>The Weight of Guessing</h2>

<p>Rohan was diagnosed at age three with autism and co-occurring sensory processing disorder. He was hypersensitive to sound, resistant to transitions, and prone to meltdowns that could last forty-five minutes or more. Anita and her husband Deepak were exhausted, isolated, and largely self-taught through a patchwork of YouTube videos and Facebook groups.</p>

<p>They enrolled in deessa Foundation''s <strong>Parent Empowerment Programme</strong> — a structured 12-week course that teaches evidence-based behavioural strategies, sensory regulation techniques, and emotional self-care for caregivers.</p>

<h2>Week by Week</h2>

<p>The early weeks were hard. Anita discovered she had been inadvertently reinforcing some of Rohan''s most challenging behaviours through inconsistent responses. "It wasn''t blame — the facilitators were very clear about that," she says. "It was information. And information I could actually use."</p>

<p>By week six, she had restructured their morning routine using visual schedules and a predictable sequence of sensory activities. Meltdowns dropped from daily occurrences to two or three per week.</p>

<blockquote>"The programme didn''t just teach me about Rohan. It taught me about myself — what I was carrying, what I needed to let go, and what I could actually control."</blockquote>

<h2>Six Months Later</h2>

<p>Rohan now attends a deessa-supported playgroup three mornings a week. His meltdowns have reduced by roughly 80%. More importantly, Anita reports something she couldn''t have imagined two years ago: "He comes to me when he''s upset now. He doesn''t know how to say it yet, but he comes and presses his face against my shoulder. That''s communication. That''s connection."</p>

<p>deessa Foundation''s Parent Empowerment Programme runs quarterly. The next cohort begins in January. Subsidised spots are available.</p>',
  'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1200&q=80&fit=crop',
  'Family Support',
  FALSE,
  TRUE,
  NOW() - INTERVAL '18 days',
  '5 min read',
  ARRAY['parent training', 'family support', 'sensory', 'autism', 'caregivers']
),

-- Story 4
(
  'From Diagnosis to Direction: Early Intervention That Works',
  'early-intervention-that-works',
  'Research is clear: the earlier the intervention, the greater the impact. Meet the three families who reached deessa Foundation before their children turned two and see what early support made possible.',
  '<p>The window is narrow. Neuroscience tells us that the first two years of life represent an extraordinary period of neural plasticity — a time when targeted, consistent intervention can meaningfully alter developmental trajectories for children with autism.</p>

<p>deessa Foundation''s Early Start Programme operates at exactly this threshold, identifying children as young as 14 months and beginning structured support before a formal diagnosis is even confirmed.</p>

<h2>Three Families, Three Stories</h2>

<p><strong>The Tamang family</strong> came to us when their daughter Maya was 18 months old, flagged by their paediatrician for limited joint attention and absence of pointing. Within six months of naturalistic developmental behavioural intervention (NDBI), Maya was using eight consistent words and initiating play with her older brother.</p>

<p><strong>Bikash</strong>, son of a single mother in Lalitpur, began the programme at 22 months after his nursery teacher noticed he did not respond to his name. By age three, he was engaging in back-and-forth conversations with peers — something his mother had been told "may never happen."</p>

<p><strong>Prabha and her twin</strong> arrived together. One twin showed clear autistic traits; the other did not. Working simultaneously with both children allowed the family to understand the neurotypical sibling''s role as a natural model — and allowed Prabha to thrive in a family environment designed with her needs in mind.</p>

<h2>What the Data Shows</h2>

<p>Across 34 children enrolled in the Early Start Programme over the past three years:</p>
<ul>
  <li>91% met or exceeded their 12-month developmental goals</li>
  <li>Average communication gains of 340% from intake to completion</li>
  <li>68% transitioned to mainstream pre-school settings with minimal support</li>
</ul>

<blockquote>"Early intervention is not about fixing children. It''s about giving their brains every opportunity the science says is available."</blockquote>

<p>— Dr. Sanjita Rai, Developmental Paediatrician, deessa Foundation Advisory Board</p>

<h2>Referral Takes Two Minutes</h2>

<p>If your child is under three and you have concerns about their development, you do not need a diagnosis to contact us. A referral from any paediatrician, ASHA worker, or self-referral from a parent is sufficient to begin our screening process.</p>',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1200&q=80&fit=crop',
  'Early Intervention',
  FALSE,
  TRUE,
  NOW() - INTERVAL '25 days',
  '6 min read',
  ARRAY['early intervention', 'toddlers', 'research', 'neural plasticity', 'autism']
),

-- Story 5
(
  'Life Skills for Life: Preparing Teenagers with Autism for Adulthood',
  'life-skills-for-adulthood',
  'What does independence look like for a teenager with autism? At deessa Foundation''s Transition Programme, 16 young adults are answering that question on their own terms.',
  '<p>Rajan is seventeen. He can prepare four different meals from scratch, navigate his local bus route independently, and manage a personal budget with a spreadsheet he built himself. Two years ago, he had never cooked, taken public transport alone, or handled money without direct supervision.</p>

<p>He is one of sixteen teenagers enrolled in deessa Foundation''s Adolescent Transition Programme, a structured two-year curriculum designed to build the practical and social skills that bridge autism support services and adult life.</p>

<h2>Why Transition Planning Is Underfunded</h2>

<p>Most autism support infrastructure — globally and in South Asia — is concentrated in early childhood. Services thin dramatically as children age, creating what practitioners call "the cliff edge": the moment a young person with autism ages out of paediatric services and finds almost nothing waiting on the other side.</p>

<p>deessa Foundation''s Transition Programme was built specifically to address this gap. It runs from age 15 to 18 and covers six domains: self-care and home management, financial literacy, community navigation, employment readiness, communication and self-advocacy, and leisure and social participation.</p>

<h2>Rajan''s Bus Route</h2>

<p>Teaching Rajan to navigate public transport took eleven weeks. The first two weeks were maps and route practice in a controlled setting. Weeks three through six involved accompanied trips with decreasing support. By week eleven, Rajan was travelling solo to his weekly vocational training placement — a printing shop where he assists with machine maintenance.</p>

<p>"He was terrified the first time," says his support worker Hari. "But terrified and capable are not the same thing. We taught him what to do when things go wrong — delayed bus, crowded platform, wrong stop — and that confidence changes everything."</p>

<blockquote>"I know my route. I know the backup route. I know what to do if I get lost. That''s what independence feels like."</blockquote>
<p style="text-align:right"><em>— Rajan, 17, Transition Programme participant</em></p>

<h2>Employment Pathways</h2>

<p>Of the twelve young people who have completed the full programme since 2022, nine are in some form of structured employment or supported work placement. The remaining three are in further education or family-run enterprises. None have returned to full-time supervised care.</p>

<p>The programme currently has a waiting list. Donations allow us to hire additional transition coaches and expand capacity from 16 to 30 participants per cohort.</p>',
  'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1200&q=80&fit=crop',
  'Transition Support',
  FALSE,
  TRUE,
  NOW() - INTERVAL '35 days',
  '7 min read',
  ARRAY['teenagers', 'life skills', 'independence', 'employment', 'transition', 'autism']
),

-- Story 6
(
  'Sensory Sanctuary: How We Redesigned Space for Every Child',
  'sensory-sanctuary-redesign',
  'A sensory-friendly room doesn''t look like a therapy room. It looks like a place where children breathe easier, engage longer, and leave calmer. Here''s how ours was built and why it matters.',
  '<p>The first thing you notice about the deessa Foundation sensory room is the light. It''s soft, adjustable, and never fluorescent. The second thing you notice is the silence — not emptiness, but a careful acoustic calm that makes the room feel buffered from the world outside.</p>

<p>The room was designed in consultation with three occupational therapists, two sensory integration specialists, and — crucially — eight children with autism whose feedback shaped every element of the space.</p>

<h2>Why Sensory Environments Matter</h2>

<p>For children with autism, sensory processing differences are not peripheral — they are central to daily experience. An environment that assaults the senses before therapy begins means a child arrives already dysregulated. Everything that follows is harder.</p>

<p>Conversely, a well-designed sensory environment can lower cortisol levels, reduce defensive behaviours, and create the physiological conditions in which learning and connection become possible.</p>

<h2>What the Children Told Us</h2>

<p>The child consultation process was itself a remarkable exercise. Rather than questionnaires, the design team used sensory preference cards, choice boards, and observation sessions to identify what different children found regulating or activating.</p>

<ul>
  <li><strong>Lighting:</strong> 7 of 8 children preferred warm, dimmable lighting over overhead fluorescents</li>
  <li><strong>Sound:</strong> White noise and nature sounds were preferred over music with lyrics</li>
  <li><strong>Texture:</strong> A dedicated tactile wall with twelve different materials was the single most requested feature</li>
  <li><strong>Pressure:</strong> Weighted blankets and a compression corner were chosen by 6 of 8 children</li>
</ul>

<blockquote>"When children feel safe in their bodies, they can be present in the room. When they''re present in the room, the real work begins."</blockquote>
<p><em>— Kavita Ghimire, Occupational Therapist, deessa Foundation</em></p>

<h2>The Impact in Numbers</h2>

<p>Since the sensory room opened in March 2024:</p>
<ul>
  <li>Average session engagement time increased from 22 minutes to 41 minutes</li>
  <li>Post-session meltdown incidents reduced by 64%</li>
  <li>Therapist-reported "best session ever" notes tripled in frequency</li>
</ul>

<p>The room is open to all enrolled children and is also available for independent regulation breaks. A second sensory room is planned for the Lalitpur satellite centre, pending funding.</p>',
  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200&q=80&fit=crop',
  'Therapy',
  FALSE,
  TRUE,
  NOW() - INTERVAL '45 days',
  '5 min read',
  ARRAY['sensory', 'occupational therapy', 'environment', 'design', 'wellbeing']
);
