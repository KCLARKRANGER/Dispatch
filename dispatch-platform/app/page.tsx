import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddTruckForm } from "@/components/add-truck-form"
import { TruckStatusManager } from "@/components/truck-status-manager"
import { DispatchBoard } from "@/components/dispatch-board"
import { JobAssignment } from "@/components/job-assignment"
import { ConnectionStatus } from "@/components/connection-status"
import { ScheduleViewer } from "@/components/schedule-viewer"
import { RoundTripEstimator } from "@/components/round-trip-estimator"

export default function Dashboard() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Spallina Asphalt Dispatch</h1>
        <div className="mt-4 md:mt-0">
          <AddTruckForm />
        </div>
      </div>

      <div className="mb-6">
        <ConnectionStatus />
      </div>

      <Tabs defaultValue="dispatch" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dispatch">Dispatch Board</TabsTrigger>
          <TabsTrigger value="trucks">Trucks & Drivers</TabsTrigger>
          <TabsTrigger value="jobs">Job Assignment</TabsTrigger>
          <TabsTrigger value="schedules">Past Schedules</TabsTrigger>
          <TabsTrigger value="estimator">Trip Estimator</TabsTrigger>
        </TabsList>

        <TabsContent value="dispatch" className="mt-6">
          <Suspense fallback={<div>Loading dispatch board...</div>}>
            <DispatchBoard />
          </Suspense>
        </TabsContent>

        <TabsContent value="trucks" className="mt-6">
          <Suspense fallback={<div>Loading truck management...</div>}>
            <TruckStatusManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <Suspense fallback={<div>Loading job assignment...</div>}>
            <JobAssignment />
          </Suspense>
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <Suspense fallback={<div>Loading schedules...</div>}>
            <ScheduleViewer />
          </Suspense>
        </TabsContent>

        <TabsContent value="estimator" className="mt-6">
          <Suspense fallback={<div>Loading trip estimator...</div>}>
            <RoundTripEstimator />
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  )
}

