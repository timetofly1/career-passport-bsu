// Maps keywords found in major/minor names to relevant interest areas
// Multiple keywords can map to the same interest
const KEYWORD_TO_INTERESTS: Record<string, string[]> = {
  'aviation': ['Aviation'],
  'accounting': ['Business, Accounting & Finance'],
  'finance': ['Business, Accounting & Finance'],
  'management': ['Business, Accounting & Finance'],
  'marketing': ['Business, Accounting & Finance'],
  'economics': ['Business, Accounting & Finance'],
  'communication': ['Communications & Media'],
  'media': ['Communications & Media'],
  'public relations': ['Communications & Media'],
  'film': ['Communications & Media', 'Fine & Performing Arts'],
  'journalism': ['Communications & Media'],
  'social work': ['Counseling & Human Services'],
  'psychology': ['Counseling & Human Services', 'Health Care & Wellness'],
  'sociology': ['Counseling & Human Services'],
  'counseling': ['Counseling & Human Services'],
  'childhood': ['Counseling & Human Services', 'Education'],
  'education': ['Education'],
  'elementary': ['Education'],
  'secondary': ['Education'],
  'special education': ['Education'],
  'art': ['Fine & Performing Arts'],
  'studio art': ['Fine & Performing Arts'],
  'music': ['Fine & Performing Arts'],
  'dance': ['Fine & Performing Arts'],
  'theatre': ['Fine & Performing Arts'],
  'theater': ['Fine & Performing Arts'],
  'political science': ['Government, Criminal Justice & Law'],
  'criminal justice': ['Government, Criminal Justice & Law'],
  'legal': ['Government, Criminal Justice & Law'],
  'public administration': ['Government, Criminal Justice & Law'],
  'health': ['Health Care & Wellness'],
  'exercise': ['Health Care & Wellness', 'Sports'],
  'physical education': ['Health Care & Wellness', 'Sports'],
  'nursing': ['Health Care & Wellness'],
  'nutrition': ['Health Care & Wellness'],
  'pre-med': ['Health Care & Wellness', 'Life Sciences & Biotechnology'],
  'pre-athletic': ['Health Care & Wellness', 'Sports'],
  'pre-ot': ['Health Care & Wellness'],
  'pre-pt': ['Health Care & Wellness'],
  'biology': ['Life Sciences & Biotechnology'],
  'biochemistry': ['Life Sciences & Biotechnology'],
  'biomedical': ['Life Sciences & Biotechnology'],
  'chemistry': ['Life Sciences & Biotechnology', 'STEM'],
  'environmental': ['Life Sciences & Biotechnology'],
  'earth': ['Life Sciences & Biotechnology', 'STEM'],
  'geological': ['Life Sciences & Biotechnology', 'STEM'],
  'geography': ['Life Sciences & Biotechnology', 'STEM'],
  'computer science': ['Technology & Cybersecurity', 'STEM'],
  'cybersecurity': ['Technology & Cybersecurity', 'STEM'],
  'information systems': ['Technology & Cybersecurity', 'STEM'],
  'mathematics': ['STEM'],
  'statistics': ['STEM'],
  'physics': ['STEM'],
  'photonics': ['STEM', 'Technology & Cybersecurity'],
  'astrophysics': ['STEM'],
  'coaching': ['Sports'],
  'athletic': ['Sports'],
  'recreation': ['Sports'],
  'graphic design': ['Fine & Performing Arts', 'Technology & Cybersecurity'],
  'photography': ['Fine & Performing Arts'],
  'anthropology': ['Counseling & Human Services'],
  'history': ['Government, Criminal Justice & Law'],
  'philosophy': ['Government, Criminal Justice & Law'],
  'english': ['Communications & Media', 'Education'],
  'spanish': ['Education'],
  'global': ['Government, Criminal Justice & Law'],
};

/**
 * Given a major and optional minors, return a deduplicated list of
 * suggested interest areas sorted alphabetically.
 */
export function getSuggestedInterests(major: string, minors: string[]): string[] {
  const allPrograms = [major, ...minors].filter(Boolean);
  const matched = new Set<string>();

  for (const program of allPrograms) {
    const lower = program.toLowerCase();
    for (const [keyword, interests] of Object.entries(KEYWORD_TO_INTERESTS)) {
      if (lower.includes(keyword)) {
        interests.forEach(i => matched.add(i));
      }
    }
  }

  return Array.from(matched).sort();
}
