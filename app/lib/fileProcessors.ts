// File processing utilities for different file formats

export interface ProcessedFile {
  content: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    wordCount: number;
    characterCount: number;
  };
}

export const processTextFile = async (file: File): Promise<ProcessedFile> => {
  const content = await file.text();
  
  return {
    content,
    metadata: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
      characterCount: content.length
    }
  };
};

export const processDocxFile = async (file: File): Promise<ProcessedFile> => {
  // For now, we'll return a placeholder since DOCX processing requires additional libraries
  // In a real implementation, you'd use libraries like mammoth.js or docx-parser
  
  return {
    content: "DOCX file processing not yet implemented. Please convert to PDF or TXT format.",
    metadata: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      wordCount: 0,
      characterCount: 0
    }
  };
};

export const processRtfFile = async (file: File): Promise<ProcessedFile> => {
  // RTF processing would require a specialized parser
  const content = await file.text();
  
  // Basic RTF content extraction (very simplified)
  const cleanContent = content
    .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
    .replace(/[{}]/g, '') // Remove braces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return {
    content: cleanContent,
    metadata: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      wordCount: cleanContent.split(/\s+/).filter(word => word.length > 0).length,
      characterCount: cleanContent.length
    }
  };
};

export const processMarkdownFile = async (file: File): Promise<ProcessedFile> => {
  const content = await file.text();
  
  // Basic markdown processing - remove markdown syntax for analysis
  const cleanContent = content
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .trim();
  
  return {
    content: cleanContent,
    metadata: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      wordCount: cleanContent.split(/\s+/).filter(word => word.length > 0).length,
      characterCount: cleanContent.length
    }
  };
};

export const processFile = async (file: File): Promise<ProcessedFile> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return processTextFile(file);
  }
  
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileType === 'application/msword' || 
      fileName.endsWith('.docx') || 
      fileName.endsWith('.doc')) {
    return processDocxFile(file);
  }
  
  if (fileType === 'application/rtf' || fileName.endsWith('.rtf')) {
    return processRtfFile(file);
  }
  
  if (fileType === 'text/markdown' || fileName.endsWith('.md')) {
    return processMarkdownFile(file);
  }
  
  if (fileName.endsWith('.odt')) {
    // ODT processing would require specialized libraries
    return {
      content: "ODT file processing not yet implemented. Please convert to PDF or TXT format.",
      metadata: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        wordCount: 0,
        characterCount: 0
      }
    };
  }
  
  // Default to text processing for unknown types
  return processTextFile(file);
};

// Skill extraction utility
export const extractSkills = (content: string): string[] => {
  const commonSkills = [
    // Technical Skills
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
    'HTML', 'CSS', 'SASS', 'SCSS', 'Tailwind', 'Bootstrap', 'jQuery',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
    'REST', 'GraphQL', 'API', 'Microservices', 'DevOps', 'CI/CD', 'Agile', 'Scrum',
    
    // Soft Skills
    'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
    'Project Management', 'Time Management', 'Adaptability', 'Creativity', 'Innovation',
    'Analytical', 'Detail-oriented', 'Collaborative', 'Self-motivated', 'Organized',
    
    // Business Skills
    'Marketing', 'Sales', 'Customer Service', 'Business Analysis', 'Data Analysis',
    'Financial Analysis', 'Strategic Planning', 'Operations', 'Supply Chain', 'Logistics',
    'Human Resources', 'Recruiting', 'Training', 'Compliance', 'Risk Management'
  ];
  
  const foundSkills: string[] = [];
  const contentLower = content.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (contentLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return [...new Set(foundSkills)]; // Remove duplicates
};

// Grammar and spelling check (basic implementation)
export const checkGrammar = (content: string): { errors: number; suggestions: string[] } => {
  const suggestions: string[] = [];
  let errors = 0;
  
  // Basic checks
  const sentences = content.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) return;
    
    // Check for sentences starting with lowercase
    if (trimmed[0] && trimmed[0] !== trimmed[0].toUpperCase()) {
      errors++;
      suggestions.push('Consider capitalizing the first letter of sentences');
    }
    
    // Check for very long sentences (>30 words)
    const words = trimmed.split(/\s+/);
    if (words.length > 30) {
      errors++;
      suggestions.push('Consider breaking down long sentences for better readability');
    }
    
    // Check for repeated words
    const wordCounts: { [key: string]: number } = {};
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 3) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
    
    Object.entries(wordCounts).forEach(([word, count]) => {
      if (count > 2) {
        errors++;
        suggestions.push(`Consider varying the use of "${word}" to avoid repetition`);
      }
    });
  });
  
  // Remove duplicate suggestions
  const uniqueSuggestions = [...new Set(suggestions)];
  
  return {
    errors,
    suggestions: uniqueSuggestions.slice(0, 5) // Limit to 5 suggestions
  };
};

// Tone analysis (basic implementation)
export const analyzeTone = (content: string): { tone: string; confidence: number; suggestions: string[] } => {
  const contentLower = content.toLowerCase();
  
  // Define tone indicators
  const toneIndicators = {
    professional: ['experience', 'expertise', 'accomplished', 'achieved', 'managed', 'led', 'developed', 'implemented'],
    confident: ['successfully', 'effectively', 'efficiently', 'proven', 'demonstrated', 'excelled', 'mastered'],
    passive: ['helped', 'assisted', 'participated', 'involved', 'contributed', 'supported'],
    weak: ['tried', 'attempted', 'hoped', 'wanted', 'wished', 'maybe', 'perhaps', 'might']
  };
  
  let professionalScore = 0;
  let confidentScore = 0;
  let passiveScore = 0;
  let weakScore = 0;
  
  // Count tone indicators
  toneIndicators.professional.forEach(word => {
    const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
    professionalScore += matches;
  });
  
  toneIndicators.confident.forEach(word => {
    const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
    confidentScore += matches;
  });
  
  toneIndicators.passive.forEach(word => {
    const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
    passiveScore += matches;
  });
  
  toneIndicators.weak.forEach(word => {
    const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
    weakScore += matches;
  });
  
  // Determine dominant tone
  const scores = {
    professional: professionalScore,
    confident: confidentScore,
    passive: passiveScore,
    weak: weakScore
  };
  
  const maxScore = Math.max(...Object.values(scores));
  const dominantTone = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'neutral';
  
  // Calculate confidence (0-100)
  const totalWords = content.split(/\s+/).length;
  const confidence = Math.min(100, Math.round((maxScore / totalWords) * 100 * 10));
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (dominantTone === 'passive') {
    suggestions.push('Use more active voice and strong action verbs');
    suggestions.push('Replace "helped with" with "managed" or "led"');
  }
  
  if (dominantTone === 'weak') {
    suggestions.push('Replace tentative language with confident statements');
    suggestions.push('Use "achieved" instead of "tried to achieve"');
  }
  
  if (professionalScore < 3) {
    suggestions.push('Include more professional terminology relevant to your field');
  }
  
  if (confidentScore < 2) {
    suggestions.push('Add more confident language to showcase your achievements');
  }
  
  return {
    tone: dominantTone,
    confidence,
    suggestions: suggestions.slice(0, 3)
  };
};