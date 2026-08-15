"use client";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Instances, Instance } from "@react-three/drei";
import * as THREE from "three";

interface TwinData {
  buildings: { id: string; type: string; x: number; z: number; height: number; w: number; d: number; has_solar: boolean }[];
  roads: { id: string; type: string; path: number[][] }[];
  forests: { id: string; name: string; x: number; z: number; radius: number; tree_count: number }[];
  water_bodies: { id: string; name: string; type: string; path: number[][]; water_level_pct: number }[];
  industries: { id: string; name: string; x: number; z: number; emissions_tons_co2: number }[];
  progress: number;
}

const BUILDING_COLORS: Record<string, string> = {
  residential: "#3f6a56",
  commercial: "#2f8e6f",
  industrial: "#5a4a3a",
  institutional: "#4a6a7a",
  mixed: "#3f7a5a",
};

function Buildings({ buildings }: { buildings: TwinData["buildings"] }) {
  return (
    <group>
      {buildings.map((b) => (
        <group key={b.id} position={[b.x / 10, 0, b.z / 10]}>
          <mesh position={[0, b.height / 20, 0]} castShadow>
            <boxGeometry args={[b.w / 10, b.height / 10, b.d / 10]} />
            <meshStandardMaterial color={BUILDING_COLORS[b.type] || "#3f6a56"} />
          </mesh>
          {b.has_solar && (
            <mesh position={[0, b.height / 10 + 0.05, 0]} rotation={[-0.15, 0, 0]}>
              <boxGeometry args={[b.w / 12, 0.05, b.d / 12]} />
              <meshStandardMaterial color="#1d3557" metalness={0.6} roughness={0.3} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function Forests({ forests }: { forests: TwinData["forests"] }) {
  const treePositions = useMemo(() => {
    const all: { x: number; z: number; scale: number }[] = [];
    forests.forEach((f) => {
      const count = Math.min(220, Math.max(20, Math.round(f.tree_count / 150)));
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (f.radius / 10);
        all.push({
          x: f.x / 10 + Math.cos(angle) * r,
          z: f.z / 10 + Math.sin(angle) * r,
          scale: 0.6 + Math.random() * 0.6,
        });
      }
    });
    return all;
  }, [forests]);

  return (
    <Instances limit={2000}>
      <coneGeometry args={[0.5, 1.4, 6]} />
      <meshStandardMaterial color="#1fa863" />
      {treePositions.map((t, i) => (
        <Instance key={i} position={[t.x, 0.7 * t.scale, t.z]} scale={t.scale} />
      ))}
    </Instances>
  );
}

function WaterBodies({ waterBodies }: { waterBodies: TwinData["water_bodies"] }) {
  return (
    <group>
      {waterBodies.map((w) => {
        if (!w.path || w.path.length === 0) return null;
        if (w.path.length === 1) {
          return (
            <mesh key={w.id} position={[w.path[0][0] / 10, 0.02, w.path[0][1] / 10]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[6, 24]} />
              <meshStandardMaterial color="#2a7ea8" transparent opacity={0.85} />
            </mesh>
          );
        }
        const points = w.path.map((p) => new THREE.Vector3(p[0] / 10, 0.02, p[1] / 10));
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeom = new THREE.TubeGeometry(curve, 64, 1.4, 8, false);
        return (
          <mesh key={w.id} geometry={tubeGeom}>
            <meshStandardMaterial color="#2a7ea8" transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

function Roads({ roads }: { roads: TwinData["roads"] }) {
  return (
    <group>
      {roads.map((r) => {
        if (!r.path || r.path.length < 2) return null;
        const points = r.path.map((p) => new THREE.Vector3(p[0] / 10, 0.01, p[1] / 10));
        const curve = new THREE.CatmullRomCurve3(points);
        const width = r.type === "highway" ? 1.2 : r.type === "metro" ? 0.4 : 0.7;
        const color = r.type === "metro" ? "#f2b544" : "#4a4a4a";
        const tubeGeom = new THREE.TubeGeometry(curve, 48, width, 6, false);
        return (
          <mesh key={r.id} geometry={tubeGeom}>
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

function Industries({ industries }: { industries: TwinData["industries"] }) {
  return (
    <group>
      {industries.map((ind) => (
        <mesh key={ind.id} position={[ind.x / 10, 1, ind.z / 10]}>
          <cylinderGeometry args={[1, 1.2, 2, 8]} />
          <meshStandardMaterial color="#6b5847" />
        </mesh>
      ))}
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#0f2e23" />
    </mesh>
  );
}

export default function DigitalTwinScene({ data }: { data: TwinData }) {
  return (
    <Canvas shadows camera={{ position: [60, 45, 60], fov: 45 }} className="rounded-2xl">
      <color attach="background" args={["#05130f"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[40, 60, 20]} intensity={1.1} castShadow />
      <Sky sunPosition={[40, 20, 20]} turbidity={6} rayleigh={1.2} />
      <Ground />
      <Roads roads={data.roads} />
      <Buildings buildings={data.buildings} />
      <Forests forests={data.forests} />
      <WaterBodies waterBodies={data.water_bodies} />
      <Industries industries={data.industries} />
      <OrbitControls enablePan enableZoom enableRotate minDistance={15} maxDistance={160} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}
