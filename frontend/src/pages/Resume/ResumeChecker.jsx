import { useState } from "react";

// Mock data
const MOCK_FEEDBACK = {
    skills: {
        technical: [
            'JavaScript',
            'React.js',
            'Node.js',
            'Python',
            'SQL',
            'Git'
        ],
        soft: [
            'Leadership',
            'Team Management',
            'Communication',
            'Problem Solving'
        ],
        missing: [
            'Docker',
            'AWS',
            'TypeScript',
            'GraphQL'
        ]
    },
    suggestions: [
        'Consider adding cloud technology experience',
        'Include specific metrics and achievements',
        'Add a section for certifications',
        'Include links to personal projects'
    ],
    score: 85,
    formatting: {
        isAtsCompatible: true,
        issues: [
            'Consider using a single font family',
            'Ensure consistent spacing between sections'
        ]
    }
};

const SCORING_CRITERIA = {
    technicalSkills: {
        weight: 35,
        minRequired: 3,
        maxScore: 35
    },
    softSkills: {
        weight: 20,
        minRequired: 2,
        maxScore: 20
    },
    formatting: {
        weight: 15,
        maxScore: 15
    },
    contactInfo: {
        weight: 10,
        maxScore: 10
    },
    keywords: {
        weight: 20,
        maxScore: 20
    },
    // Mappings for score breakdown
    technical: { maxScore: 35 },
    soft: { maxScore: 20 },
    contact: { maxScore: 10 },
    
};

const IMPORTANT_KEYWORDS = [
    'achieved',
    'developed',
    'led',
    'managed',
    'created',
    'improved',
    'increased',
    'decreased',
    'resolved',
    'implemented'
];

function ResumeChecker() {
    const [resumeFile, setResumeFile] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisMethod, setAnalysisMethod] = useState('real');

    const handleFileChange = (e) => {
        setResumeFile(e.target.files[0]);
        setFeedback(null);
    };

    const getMockAnalysis = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_FEEDBACK);
            }, 2000);
        });
    };

    const analyzeResume = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result.toLowerCase();
                
                const analysis = {
                    skills: {
                        technical: [],
                        soft: [],
                        missing: []
                    },
                    suggestions: [],
                    score: 0,
                    formatting: {
                        isAtsCompatible: false,
                        issues: []
                    },
                    scoreBreakdown: {}
                };

                const technicalKeywords = [
                    'javascript', 'python', 'java', 'react', 'angular', 'node',
                    'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git',
                    'html', 'css', 'typescript', 'redux', 'vue', 'express'
                ];

                const softKeywords = [
                    'leadership', 'communication', 'team', 'manage', 'collaborate',
                    'problem solving', 'analytical', 'project management', 'agile',
                    'presentation', 'mentoring', 'coordination'
                ];

                // Check for technical skills
                technicalKeywords.forEach(skill => {
                    if (text.includes(skill)) {
                        analysis.skills.technical.push(skill.charAt(0).toUpperCase() + skill.slice(1));
                    } else {
                        analysis.skills.missing.push(skill.charAt(0).toUpperCase() + skill.slice(1));
                    }
                });

                // Check for soft skills
                softKeywords.forEach(skill => {
                    if (text.includes(skill)) {
                        analysis.skills.soft.push(skill.charAt(0).toUpperCase() + skill.slice(1));
                    }
                });

                // Calculate scores
                const technicalScore = Math.min(
                    (analysis.skills.technical.length / technicalKeywords.length) * SCORING_CRITERIA.technicalSkills.maxScore,
                    SCORING_CRITERIA.technicalSkills.maxScore
                );

                const softScore = Math.min(
                    (analysis.skills.soft.length / softKeywords.length) * SCORING_CRITERIA.softSkills.maxScore,
                    SCORING_CRITERIA.softSkills.maxScore
                );

                let formattingScore = SCORING_CRITERIA.formatting.maxScore;
                analysis.formatting.isAtsCompatible = !text.includes('table') && !text.includes('image');
                
                const formattingIssues = [];
                if (!analysis.formatting.isAtsCompatible) {
                    formattingScore -= 5;
                    formattingIssues.push('Contains elements that may not be ATS-friendly');
                }
                if (text.includes('  ')) {
                    formattingScore -= 3;
                    formattingIssues.push('Contains inconsistent spacing');
                }
                if (text.length < 1000) {
                    formattingScore -= 4;
                    formattingIssues.push('Resume might be too short');
                }
                analysis.formatting.issues = formattingIssues;

                let contactScore = 0;
                if (text.includes('@')) contactScore += 3;
                if (/\d{10}/.test(text)) contactScore += 3;
                if (/linkedin\.com/.test(text)) contactScore += 4;

                const keywordMatches = IMPORTANT_KEYWORDS.filter(keyword => 
                    text.includes(keyword)
                ).length;
                const keywordScore = (keywordMatches / IMPORTANT_KEYWORDS.length) * SCORING_CRITERIA.keywords.maxScore;

                const totalScore = Math.round(
                    technicalScore +
                    softScore +
                    formattingScore +
                    contactScore +
                    keywordScore
                );

                analysis.scoreBreakdown = {
                    technical: Math.round(technicalScore),
                    soft: Math.round(softScore),
                    formatting: Math.round(formattingScore),
                    contact: Math.round(contactScore),
                    keywords: Math.round(keywordScore)
                };

                analysis.score = Math.min(totalScore, 100);

                // Generate suggestions
                if (analysis.skills.technical.length < SCORING_CRITERIA.technicalSkills.minRequired) {
                    analysis.suggestions.push('Add more technical skills (aim for at least 3)');
                }
                if (analysis.skills.soft.length < SCORING_CRITERIA.softSkills.minRequired) {
                    analysis.suggestions.push('Include more soft skills (aim for at least 2)');
                }
                if (!text.includes('@')) {
                    analysis.suggestions.push('Add contact information including email');
                }
                if (!text.includes('linkedin.com')) {
                    analysis.suggestions.push('Add LinkedIn profile URL');
                }
                if (keywordMatches < 5) {
                    analysis.suggestions.push('Use more action verbs to describe achievements');
                }

                resolve(analysis);
            };

            reader.readAsText(file);
        });
    };

    const handleSubmit = async () => {
        if (!resumeFile) {
            alert('Please select a file first');
            return;
        }

        setLoading(true);
        try {
            setTimeout(async ()=>{
                const analysis = analysisMethod === 'mock' 
                    ? await getMockAnalysis()
                    : await analyzeResume(resumeFile);
                setFeedback(analysis);
            },3000)
        } catch (error) {
            console.error('Error:', error);
            setFeedback({ error: 'Error processing your resume. Please try again.' });
        } finally {
            setTimeout(()=>{
                setLoading(false);
                },3000)
        }
    };

    return (
        <div className="min-h-screen bg-green-100 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Resume Analysis Tool
                </h2>
                
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Analysis Method:
                    </label>
                    <select 
                        value={analysisMethod}
                        onChange={(e) => setAnalysisMethod(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                        <option value="real">Real-Time Analysis</option>
                        <option value="mock">Sample Analysis</option>
                    </select>
                </div>

                <div className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <input 
                            type="file" 
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt"
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-purple-50 file:text-green-700
                            hover:file:bg-green-100
                            cursor-pointer"
                        />
                        <button 
                            onClick={handleSubmit}
                            disabled={loading || !resumeFile}
                            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white 
                                ${loading || !resumeFile 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-500 hover:bg-green-700 transform hover:-translate-y-0.5 transition-all duration-200'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing Resume...
                                </span>
                            ) : 'Analyze Resume'}
                        </button>
                    </div>
                </div>

                {feedback && !feedback.error && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Overall Score: {feedback.score}/100</h3>
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        feedback.score >= 80 ? 'bg-green-500' :
                                        feedback.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${feedback.score}%` }}
                                ></div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-700">Detailed Breakdown:</h4>
                                    {Object.entries(feedback.scoreBreakdown).map(([key, value], index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <span className="capitalize text-gray-600">{key}:</span>
                                            <span className="font-medium text-gray-800">
                                                {value}/{SCORING_CRITERIA[key]?.maxScore || 20}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-purple-800 mb-2">Score Guide:</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center text-green-700">
                                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                            90-100: Excellent
                                        </li>
                                        <li className="flex items-center text-blue-700">
                                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                            80-89: Very Good
                                        </li>
                                        <li className="flex items-center text-yellow-700">
                                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                            70-79: Good
                                        </li>
                                        <li className="flex items-center text-orange-700">
                                            <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                                            60-69: Needs Improvement
                                        </li>
                                        <li className="flex items-center text-red-700">
                                            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                            &lt;60: Significant Updates Needed
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Technical Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.skills.technical.map((skill, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Soft Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.skills.soft.map((skill, index) => (
                                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Suggested Improvements</h4>
                            <ul className="space-y-3">
                                {feedback.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <svg className="w-6 h-6 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span className="text-gray-700">{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">ATS Compatibility</h4>
                            <div className={`flex items-center space-x-2 ${feedback.formatting.isAtsCompatible ? 'text-green-600' : 'text-red-600'}`}>
                                {feedback.formatting.isAtsCompatible ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                <span className="font-medium">
                                    {feedback.formatting.isAtsCompatible ? 'ATS Compatible' : 'Not ATS Compatible'}
                                </span>
                            </div>
                            {feedback.formatting.issues.length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {feedback.formatting.issues.map((issue, index) => (
                                        <li key={index} className="flex items-start space-x-2 text-red-600">
                                            <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{issue}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {feedback?.error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-3 text-red-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{feedback.error}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResumeChecker;