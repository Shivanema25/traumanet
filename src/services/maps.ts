// Google Maps & Routing Intelligence Service
import { HospitalRecommendation } from "@/types";
import { getHospitals } from "@/lib/firestore";
import { calculateMockHospitalRankings } from "@/lib/demo/mockServices";

export async function rankHospitalsAndRoute(
  origin: { lat: number; lng: number },
  traumaScore: number
): Promise<HospitalRecommendation[]> {
  try {
    const hospitals = await getHospitals();

    // Calculate distance, travel time, and priority suitability
    const recommendations: HospitalRecommendation[] = hospitals.map((h) => {
      // Haversine rough estimate
      const dLat = (h.location.lat - origin.lat) * 111;
      const dLng = (h.location.lng - origin.lng) * 105;
      const distanceKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
      
      // Speed estimate: 30 km/h in urban emergency transit
      const etaMinutes = Math.max(3, Math.round((distanceKm / 35) * 60));

      // Scoring formula: Dependability (35%) + Bed Availability (35%) + Proximity (30%)
      const bedScore = Math.min(35, h.availableIcuBeds * 3);
      const distScore = Math.max(0, 30 - distanceKm * 2);
      const depScore = (h.dependabilityScore / 100) * 35;
      const matchScore = Math.min(99, Math.round(bedScore + distScore + depScore));

      let reason = `${h.availableIcuBeds} ICU beds available, ${h.traumaLevel.replace('_', ' ')}`;
      if (traumaScore >= 8.0 && h.traumaLevel === "LEVEL_1") {
        reason = "Primary Level-1 trauma center recommended for acute resuscitation";
      }

      return {
        hospital: h,
        etaMinutes,
        distanceKm,
        matchScore,
        reason,
        isSoftLockable: h.availableIcuBeds > 0,
      };
    });

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  } catch (err) {
    console.warn("Maps calculation error, using fallback rankings:", err);
    return calculateMockHospitalRankings(origin.lat, origin.lng);
  }
}
