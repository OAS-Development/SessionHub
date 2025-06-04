'use client'

import React, { useState } from 'react'
import { useAutoCapture, useLearning } from '@/lib/hooks/useLearning'

export default function LearningCaptureDemo() {
  const [instruction, setInstruction] = useState('')
  const [response, setResponse] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const { autoCapture } = useAutoCapture('demo-session-' + Date.now())
  const { analyzeInstruction } = useLearning()
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleCapture = async () => {
    if (!instruction.trim() || !response.trim()) {
      alert('Please enter both instruction and response')
      return
    }

    setIsCapturing(true)
    try {
      // Capture the interaction
      await autoCapture(instruction, response, {
        instructionType: 'code_generation',
        responseType: 'code',
        executionTime: Math.random() * 3000,
        filesModified: ['demo.tsx'],
        success: true,
        context: { demo: true, timestamp: Date.now() }
      })

      // Analyze the instruction for patterns
      const analysis = await analyzeInstruction(instruction, { demo: true })
      setAnalysisResult(analysis)

      alert('Interaction captured successfully!')
    } catch (error) {
      console.error('Capture failed:', error)
      alert('Failed to capture interaction')
    } finally {
      setIsCapturing(false)
    }
  }

  const clearForm = () => {
    setInstruction('')
    setResponse('')
    setAnalysisResult(null)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Learning Capture Demo 🎯
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Try capturing a Claude-Cursor interaction to see how the learning system works.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Claude Instruction
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., Create a React component for displaying user profiles with TypeScript"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cursor Response
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="e.g., interface UserProfile { id: string; name: string; ... }"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCapture}
            disabled={isCapturing || !instruction.trim() || !response.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCapturing ? 'Capturing...' : 'Capture Interaction'}
          </button>
          
          <button
            onClick={clearForm}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {analysisResult && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Pattern Analysis Results</h4>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Success Prediction</h5>
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 h-2 rounded-full flex-1 max-w-xs">
                  <div 
                    className="bg-blue-200 h-2 rounded-full"
                    style={{ width: `${analysisResult.successPrediction * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-blue-700">
                  {Math.round(analysisResult.successPrediction * 100)}%
                </span>
              </div>
            </div>

            {analysisResult.matchedPatterns.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-2">
                  Matched Patterns ({analysisResult.matchedPatterns.length})
                </h5>
                <div className="space-y-2">
                  {analysisResult.matchedPatterns.slice(0, 3).map((pattern: any) => (
                    <div key={pattern.id} className="text-sm">
                      <span className="font-medium text-green-800">
                        {pattern.pattern_description}
                      </span>
                      <span className="text-green-600 ml-2">
                        ({Math.round(pattern.success_rate * 100)}% success rate)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.recommendedImprovements.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-medium text-yellow-900 mb-2">Recommendations</h5>
                <ul className="space-y-1">
                  {analysisResult.recommendedImprovements.map((improvement: string, index: number) => (
                    <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 