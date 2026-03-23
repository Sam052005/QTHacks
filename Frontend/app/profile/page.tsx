'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/lib/auth-store'
import { User, LogOut, BookOpen, Calendar, Plus, Folder, Clock } from 'lucide-react'

interface Project {
  id: string;
  name: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user, token, logout } = useAuthStore()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (!token) return
    fetch('http://localhost:3001/api/projects/list', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => setProjects(data.projects || []))
    .catch(console.error)
  }, [token])

  if (!user) {
    return null
  }

  const handleStartProject = async () => {
    if (!token) return
    setIsCreating(true)
    try {
      const res = await fetch('http://localhost:3001/api/projects/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: 'New Logic Workspace' })
      })
      const data = await res.json()
      if (data.project) {
        // Send them to the simulator with this context
        router.push(`/?projectId=${data.project.id}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8 pt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* User Profile Card */}
        <Card className="col-span-1 h-fit">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">{user.username}</CardTitle>
            <p className="text-muted-foreground">Student Profile</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">College Year</p>
                  <p className="font-medium text-sm">{user.collegeYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <BookOpen className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Course</p>
                  <p className="font-medium text-sm">{user.course}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Button variant="outline" onClick={() => router.push('/')}>
                Guest Simulator
              </Button>
              <Button variant="destructive" className="gap-2" onClick={() => {
                logout()
                router.push('/login')
              }}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Projects Pane */}
        <Card className="col-span-1 md:col-span-2 shadow-lg border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
            <div>
              <CardTitle className="text-2xl">My Projects</CardTitle>
              <CardDescription>Manage your sequential logic simulator workspaces</CardDescription>
            </div>
            <Button onClick={handleStartProject} disabled={isCreating} className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Start a Project
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/20 rounded-xl border border-dashed border-border">
                <Folder className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground">No projects yet</h3>
                <p className="text-sm text-muted-foreground max-w-[250px] mt-2 mb-6">
                  Create your first workspace to start building logic circuits with AI assistance tracking your progress.
                </p>
                <Button onClick={handleStartProject} disabled={isCreating} variant="secondary" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => router.push(`/?projectId=${project.id}`)}
                    className="group relative cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Folder className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Saved logic workspace</p>
                    
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
