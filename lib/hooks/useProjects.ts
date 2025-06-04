import { useState, useEffect } from 'react'

// Define the project interface
interface Project {
  id: string
  name: string
  description?: string | null
  language?: string | null
  framework?: string | null
  techStack: string[]
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED' | 'ON_HOLD'
  createdAt: Date
  lastSessionAt?: Date | null
  totalSessions: number
  totalSessionTime: number
  totalAIInteractions?: number
  avgSessionDuration?: number | null
  totalLinesAdded?: number
  totalLinesDeleted?: number
  totalCommits?: number
}

interface CreateProjectData {
  name: string
  description?: string
  language?: string
  framework?: string
  techStack?: string[]
  repositoryUrl?: string
  targetGoal?: string
}

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  createProject: (data: CreateProjectData) => Promise<Project | null>
  refetch: () => Promise<void>
  creating: boolean
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Transform timestamps back to Date objects
      const transformedProjects = data.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        lastSessionAt: project.lastSessionAt ? new Date(project.lastSessionAt) : null
      }))
      
      setProjects(transformedProjects)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects'
      setError(errorMessage)
      console.error('Projects fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (data: CreateProjectData): Promise<Project | null> => {
    try {
      setCreating(true)
      setError(null)
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create project')
      }
      
      const newProject = await response.json()
      
      // Transform timestamp
      const transformedProject = {
        ...newProject,
        createdAt: new Date(newProject.createdAt),
        lastSessionAt: newProject.lastSessionAt ? new Date(newProject.lastSessionAt) : null,
        totalSessions: 0,
        totalSessionTime: 0
      }
      
      // Add to local state (optimistic update)
      setProjects(prev => [transformedProject, ...prev])
      
      return transformedProject
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project'
      setError(errorMessage)
      console.error('Project creation error:', err)
      return null
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    createProject,
    refetch: fetchProjects,
    creating
  }
} 