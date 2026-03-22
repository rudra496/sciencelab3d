"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Legacy experiment route redirector.
 * Old URLs like /experiment/pendulum now redirect to /experiments/pendulum
 */
export default function ExperimentRedirectPage() {
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      window.location.href = `/experiments/${id}`;
    }
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center text-gray-400">
        <div className="animate-spin text-4xl mb-4">🔄</div>
        <p>Redirecting to experiment...</p>
      </div>
    </div>
  );
}
