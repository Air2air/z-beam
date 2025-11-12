// app/components/ParameterRelationships/ParameterRelationships.tsx
"use client";

import React, { useState, useMemo } from "react";
import { formatKeyAsTitle } from "@/app/utils/metricsCardHelpers";
import { SectionContainer } from "@/app/components/SectionContainer/SectionContainer";
import type {
  NetworkParameter,
  ParameterRelationship,
  ParameterRelationshipsProps,
  RelationshipType,
} from "@/types/centralized";

/**
 * Pre-filled relationship descriptions for clarity
 * Key format: "from_to_type"
 */
const RELATIONSHIP_DESCRIPTIONS: Record<string, string> = {
  // Power relationships
  powerRange_pulseWidth_amplifies:
    "More power means higher peak intensity. Too much can damage the material.",
  powerRange_pulseDuration_amplifies:
    "More power means higher peak intensity. Too much can damage the material.",
  powerRange_energyDensity_amplifies:
    "Higher power delivers more energy per pulse, removing more material.",
  powerRange_fluence_amplifies:
    "Higher power delivers more energy per pulse, removing more material.",
  powerRange_spotSize_constrains:
    "Same power in a smaller spot creates much higher energy density.",

  // Pulse width/duration relationships
  pulseWidth_energyDensity_amplifies:
    "Longer pulses let more heat build up in the material.",
  pulseDuration_energyDensity_amplifies:
    "Longer pulses let more heat build up in the material.",
  pulseWidth_fluence_amplifies:
    "Longer pulses deliver more total energy and heat goes deeper.",
  pulseDuration_fluence_amplifies:
    "Longer pulses deliver more total energy and heat goes deeper.",

  // Repetition rate relationships
  repetitionRate_scanSpeed_constrains:
    "Faster pulses mean you need to scan faster to maintain spacing.",
  frequency_scanSpeed_constrains:
    "Faster pulses mean you need to scan faster to maintain spacing.",
  repetitionRate_overlapRatio_enables:
    "More pulses per second lets you overlap more at the same speed.",
  repetitionRate_overlap_enables:
    "More pulses per second lets you overlap more at the same speed.",
  frequency_overlapRatio_enables:
    "More pulses per second lets you overlap more at the same speed.",
  frequency_overlap_enables:
    "More pulses per second lets you overlap more at the same speed.",

  // Scan speed relationships
  scanSpeed_overlapRatio_reduces:
    "Scanning faster means less overlap between pulses.",
  scanSpeed_overlap_reduces:
    "Scanning faster means less overlap between pulses.",

  // Overlap and pass count relationships
  overlapRatio_passCount_reduces:
    "Better overlap in each pass means fewer total passes needed.",
  overlap_passCount_reduces:
    "Better overlap in each pass means fewer total passes needed.",
  overlapRatio_passes_reduces:
    "Better overlap in each pass means fewer total passes needed.",
  overlap_passes_reduces:
    "Better overlap in each pass means fewer total passes needed.",
  passCount_powerRange_reduces:
    "Using more passes means you can use lower power and still get the job done.",
  passes_powerRange_reduces:
    "Using more passes means you can use lower power and still get the job done.",

  // Spot size relationships
  spotSize_scanSpeed_enables:
    "A bigger spot lets you scan faster while keeping good coverage.",
  spotSize_overlapRatio_constrains:
    "Smaller spots need slower scanning to maintain overlap.",
  spotSize_overlap_constrains:
    "Smaller spots need slower scanning to maintain overlap.",
  spotSize_energyDensity_constrains:
    "Smaller spots concentrate energy into a smaller area.",
  spotSize_fluence_constrains:
    "Smaller spots concentrate energy into a smaller area.",

  // Energy density relationships
  energyDensity_passCount_reduces:
    "Higher energy per pulse might let you do fewer passes, but risks damage.",
  energyDensity_passes_reduces:
    "Higher energy per pulse might let you do fewer passes, but risks damage.",
  fluence_passCount_reduces:
    "Higher energy per pulse might let you do fewer passes, but risks damage.",
  fluence_passes_reduces:
    "Higher energy per pulse might let you do fewer passes, but risks damage.",

  // Wavelength relationships
  wavelength_energyDensity_amplifies:
    "The right wavelength gets absorbed better, making energy transfer more efficient.",
  wavelength_fluence_amplifies:
    "The right wavelength gets absorbed better, making energy transfer more efficient.",
};

/**
 * Get clear, concise description for a relationship
 */
const getRelationshipDescription = (
  from: string,
  to: string,
  type: string,
  fallback: string
): string => {
  const key = `${from}_${to}_${type}`;
  return RELATIONSHIP_DESCRIPTIONS[key] || fallback;
};

/**
 * Force-directed network graph showing parameter interdependencies
 * Automatically derives material-specific relationships from parameter data
 */
export const ParameterRelationships: React.FC<ParameterRelationshipsProps> = ({
  parameters,
  materialName,
}) => {
  // Derive material-specific relationships from parameter data
  const relationships: ParameterRelationship[] = useMemo(() => {
    const relations: ParameterRelationship[] = [];

    // Helper to find parameter by ID
    const findParam = (id: string) => parameters.find((p) => p.id === id);

    // POWER-BASED RELATIONSHIPS
    const power = findParam("powerRange");
    const pulse = findParam("pulseWidth") || findParam("pulseDuration");
    const energy = findParam("energyDensity") || findParam("fluence");
    const spot = findParam("spotSize");

    if (power && pulse) {
      const isPulseCritical =
        pulse.criticality === "critical" || pulse.criticality === "high";
      relations.push({
        from: "powerRange",
        to: pulse.id,
        type: "amplifies",
        strength: isPulseCritical ? "strong" : "moderate",
        description: getRelationshipDescription(
          "powerRange",
          pulse.id,
          "amplifies",
          `Higher power with ${pulse.name.toLowerCase()} determines peak intensity.`
        ),
      });
    }

    if (power && energy) {
      relations.push({
        from: "powerRange",
        to: energy.id,
        type: "amplifies",
        strength: "strong",
        description: getRelationshipDescription(
          "powerRange",
          energy.id,
          "amplifies",
          `Power directly controls ${energy.name.toLowerCase()}.`
        ),
      });
    }

    if (power && spot) {
      relations.push({
        from: "powerRange",
        to: "spotSize",
        type: "constrains",
        strength: "strong",
        description: getRelationshipDescription(
          "powerRange",
          "spotSize",
          "constrains",
          "Power density = Power / Spot Area."
        ),
      });
    }

    // PULSE WIDTH/DURATION RELATIONSHIPS
    if (pulse && energy) {
      const mechanism = pulse.material_interaction?.mechanism || "";
      const isThermalConfined =
        mechanism.toLowerCase().includes("thermal") ||
        mechanism.toLowerCase().includes("confined");
      relations.push({
        from: pulse.id,
        to: energy.id,
        type: "amplifies",
        strength: isThermalConfined ? "strong" : "moderate",
        description: getRelationshipDescription(
          pulse.id,
          energy.id,
          "amplifies",
          "Pulse duration affects energy coupling."
        ),
      });
    }

    // REPETITION RATE RELATIONSHIPS
    const repRate = findParam("repetitionRate") || findParam("frequency");
    const scanSpeed = findParam("scanSpeed");
    const overlap = findParam("overlapRatio") || findParam("overlap");

    if (repRate && scanSpeed) {
      const isHighCriticality =
        repRate.criticality === "critical" || repRate.criticality === "high";
      relations.push({
        from: "repetitionRate",
        to: "scanSpeed",
        type: "constrains",
        strength: isHighCriticality ? "strong" : "moderate",
        description: getRelationshipDescription(
          repRate.id,
          "scanSpeed",
          "constrains",
          "Pulse spacing = Scan speed / Rep rate."
        ),
      });
    }

    if (repRate && overlap) {
      relations.push({
        from: "repetitionRate",
        to: overlap.id,
        type: "enables",
        strength: "strong",
        description: getRelationshipDescription(
          repRate.id,
          overlap.id,
          "enables",
          "Higher rep rate enables greater overlap at same scan speed."
        ),
      });
    }

    // SCAN SPEED RELATIONSHIPS
    if (scanSpeed && overlap) {
      relations.push({
        from: "scanSpeed",
        to: overlap.id,
        type: "reduces",
        strength: "strong",
        description: getRelationshipDescription(
          "scanSpeed",
          overlap.id,
          "reduces",
          "Faster scanning reduces pulse overlap."
        ),
      });
    }

    // OVERLAP & PASS COUNT RELATIONSHIPS
    const passCount = findParam("passCount") || findParam("passes");
    if (overlap && passCount) {
      relations.push({
        from: overlap.id,
        to: passCount.id,
        type: "reduces",
        strength: "moderate",
        description: getRelationshipDescription(
          overlap.id,
          passCount.id,
          "reduces",
          "Higher overlap reduces needed passes."
        ),
      });
    }

    if (passCount && power) {
      relations.push({
        from: passCount.id,
        to: "powerRange",
        type: "reduces",
        strength: "moderate",
        description: getRelationshipDescription(
          passCount.id,
          "powerRange",
          "reduces",
          "Multiple passes allow lower power per pass."
        ),
      });
    }

    // SPOT SIZE RELATIONSHIPS
    if (spot && scanSpeed) {
      relations.push({
        from: "spotSize",
        to: "scanSpeed",
        type: "enables",
        strength: "moderate",
        description: getRelationshipDescription(
          "spotSize",
          "scanSpeed",
          "enables",
          "Larger spots enable faster scanning for same overlap."
        ),
      });
    }

    if (spot && energy) {
      relations.push({
        from: "spotSize",
        to: energy.id,
        type: "constrains",
        strength: "strong",
        description: getRelationshipDescription(
          "spotSize",
          energy.id,
          "constrains",
          "Fluence = Energy / (π × (Spot/2)²). Spot size determines energy density."
        ),
      });
    }

    // WAVELENGTH RELATIONSHIPS (if present)
    const wavelength = findParam("wavelength");
    if (wavelength && energy) {
      const hasSelectiveAbsorption =
        wavelength.rationale?.toLowerCase().includes("selective") ||
        wavelength.rationale?.toLowerCase().includes("absorption");
      if (hasSelectiveAbsorption) {
        relations.push({
          from: "wavelength",
          to: energy.id,
          type: "amplifies",
          strength: "moderate",
          description:
            "Wavelength determines absorption efficiency. Higher absorption increases effective energy coupling.",
        });
      }
    }

    // Remove duplicate relationships and filter out self-references
    const uniqueRelations = relations.filter(
      (rel, index, self) =>
        index ===
          self.findIndex((r) => r.from === rel.from && r.to === rel.to) &&
        rel.from !== rel.to &&
        findParam(rel.from) &&
        findParam(rel.to) // Ensure both parameters exist
    );

    return uniqueRelations;
  }, [parameters]);

  // Find the most connected parameter as default selection
  const getDefaultSelection = useMemo(() => {
    if (parameters.length === 0) return null;

    // Count connections for each parameter
    const connectionCounts = parameters.map((param) => {
      const outgoing = relationships.filter(
        (rel) => rel.from === param.id
      ).length;
      const incoming = relationships.filter(
        (rel) => rel.to === param.id
      ).length;
      return {
        id: param.id,
        connections: outgoing + incoming,
      };
    });

    // Return parameter with most connections (or first if tie)
    const sorted = connectionCounts.sort(
      (a, b) => b.connections - a.connections
    );
    return sorted[0]?.id || parameters[0].id;
  }, [parameters, relationships]);

  const [selectedParam, setSelectedParam] = useState<string | null>(
    getDefaultSelection
  );
  const [hoveredRelation, setHoveredRelation] =
    useState<ParameterRelationship | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [autoCycling, setAutoCycling] = useState(true); // Track if auto-cycling is active
  const [userInteracted, setUserInteracted] = useState(false); // Track if user has clicked

  // Auto-cycle through connected nodes on initial load
  React.useEffect(() => {
    if (!autoCycling || !selectedParam || userInteracted) return;

    const connectedNodes = relationships
      .filter((rel) => rel.from === selectedParam || rel.to === selectedParam)
      .map((rel) => (rel.from === selectedParam ? rel.to : rel.from))
      .sort((a, b) => {
        const aIndex = parameters.findIndex((p) => p.id === a);
        const bIndex = parameters.findIndex((p) => p.id === b);
        return aIndex - bIndex;
      });

    if (connectedNodes.length === 0) {
      setAutoCycling(false);
      return;
    }

    // Include the selected node in the cycle
    const nodesToCycle = [selectedParam, ...connectedNodes];

    let currentIndex = 0;
    const cycleInterval = setInterval(() => {
      setHoveredNode(nodesToCycle[currentIndex]);
      currentIndex = (currentIndex + 1) % nodesToCycle.length; // Loop back to start
    }, 3000); // 3 seconds per node

    return () => clearInterval(cycleInterval);
  }, [autoCycling, selectedParam, relationships, parameters, userInteracted]);

  // Handle user click on node - stops auto-cycling
  const handleNodeClick = (paramId: string) => {
    // Do nothing if clicking the already-selected node
    if (selectedParam === paramId) return;
    
    setUserInteracted(true);
    setAutoCycling(false);
    setSelectedParam(paramId);
    // Highlight the newly selected parameter
    setHoveredNode(paramId);
  };

  // Layout parameters in a circle
  const centerX = 200;
  const centerY = 200;
  const radius = 130;

  // Calculate rotation offset to position selected node at top
  const rotationOffset = useMemo(() => {
    if (!selectedParam) return 0;
    const selectedIndex = parameters.findIndex((p) => p.id === selectedParam);
    if (selectedIndex === -1) return 0;
    // Calculate the base angle of the selected node (same formula as baseAngle below)
    const selectedBaseAngle =
      (selectedIndex / parameters.length) * 2 * Math.PI - Math.PI / 2;
    // We want the selected node at -π/2 (top), so calculate the needed rotation
    // Target angle (-π/2) minus current base angle gives us the rotation needed
    return -Math.PI / 2 - selectedBaseAngle;
  }, [selectedParam, parameters]);

  const paramPositions = parameters.reduce((acc, param, index) => {
    // Calculate base angle starting from -π/2 (top) and going clockwise
    // Don't apply rotationOffset here - we'll rotate the entire group
    const baseAngle = (index / parameters.length) * 2 * Math.PI - Math.PI / 2;
    acc[param.id] = {
      x: centerX + radius * Math.cos(baseAngle),
      y: centerY + radius * Math.sin(baseAngle),
    };
    return acc;
  }, {} as Record<string, { x: number; y: number }>);

  const getRelationshipColor = (type: RelationshipType): string => {
    switch (type) {
      case "amplifies":
        return "#EF4444"; // red - increases risk
      case "reduces":
        return "#10B981"; // green - reduces risk
      case "constrains":
        return "#F59E0B"; // amber - limits options
      case "enables":
        return "#3B82F6"; // blue - opens possibilities
      default:
        return "#6B7280";
    }
  };

  const darkenColor = (hex: string, percent: number = 30): string => {
    // Remove # if present
    hex = hex.replace("#", "");

    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Darken by percentage
    const factor = (100 - percent) / 100;
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  };

  const hexToRgba = (hex: string, alpha: number): string => {
    // Remove # if present
    hex = hex.replace("#", "");

    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getRelationshipIcon = (type: RelationshipType): string => {
    switch (type) {
      case "amplifies":
        return "⚠️";
      case "reduces":
        return "✓";
      case "constrains":
        return "🔒";
      case "enables":
        return "🔓";
      default:
        return "•";
    }
  };

  const getCriticalityColor = (
    criticality: NetworkParameter["criticality"]
  ): string => {
    switch (criticality) {
      case "critical":
        return "#DC2626";
      case "high":
        return "#F97316";
      case "medium":
        return "#FBBF24";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getDominantRelationshipType = (
    paramId: string
  ): RelationshipType | null => {
    const outgoing = relationships.filter((rel) => rel.from === paramId);
    if (outgoing.length === 0) return null;

    // Count relationship types
    const counts = outgoing.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Return most common type
    return Object.entries(counts).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0][0] as RelationshipType;
  };

  const getNodeColor = (param: NetworkParameter): string => {
    const dominantType = getDominantRelationshipType(param.id);
    if (!dominantType) return "#6B7280";
    return getRelationshipColor(dominantType);
  };

  const getConnectedParams = (paramId: string): Set<string> => {
    const connected = new Set<string>();
    relationships.forEach((rel) => {
      if (rel.from === paramId) connected.add(rel.to);
      if (rel.to === paramId) connected.add(rel.from);
    });
    return connected;
  };

  const connectedParams = selectedParam
    ? getConnectedParams(selectedParam)
    : new Set();

  // Analyze role of selected parameter
  const getParameterRole = (paramId: string) => {
    const outgoing = relationships.filter((rel) => rel.from === paramId);
    const incoming = relationships.filter((rel) => rel.to === paramId);

    // Count relationship types (outgoing only for role determination)
    const typeCounts = outgoing.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalOutgoing = outgoing.length;
    const totalIncoming = incoming.length;
    const totalConnections = totalOutgoing + totalIncoming;

    // Determine primary role based on outgoing relationships
    let primaryRole = "Independent";
    let roleIcon = "🔷";
    let roleDescription = "No significant connections";

    if (totalOutgoing === 0 && totalIncoming > 0) {
      primaryRole = "Downstream Effect";
      roleIcon = "⬇️";
      roleDescription = "Primarily affected by other parameters";
    } else if (totalOutgoing > 0 && totalIncoming === 0) {
      primaryRole = "Upstream Driver";
      roleIcon = "⬆️";
      roleDescription = "Primarily affects other parameters";
    } else if (totalConnections >= 5) {
      primaryRole = "Hub";
      roleIcon = "🌐";
      roleDescription = "Highly interconnected with many parameters";
    } else if (
      typeCounts.amplifies &&
      typeCounts.amplifies >= totalOutgoing * 0.5
    ) {
      primaryRole = "Risk Amplifier";
      roleIcon = "⚠️";
      roleDescription = "Increases damage potential downstream";
    } else if (
      typeCounts.reduces &&
      typeCounts.reduces >= totalOutgoing * 0.5
    ) {
      primaryRole = "Safety Control";
      roleIcon = "✓";
      roleDescription = "Reduces risk in connected parameters";
    } else if (
      typeCounts.constrains &&
      typeCounts.constrains >= totalOutgoing * 0.5
    ) {
      primaryRole = "Bottleneck";
      roleIcon = "🔒";
      roleDescription = "Limits options for other parameters";
    } else if (
      typeCounts.enables &&
      typeCounts.enables >= totalOutgoing * 0.5
    ) {
      primaryRole = "Enabler";
      roleIcon = "🔓";
      roleDescription = "Opens possibilities for other parameters";
    } else if (totalOutgoing > 0 && totalIncoming > 0) {
      primaryRole = "Mediator";
      roleIcon = "⚖️";
      roleDescription = "Balances incoming and outgoing influences";
    }

    return {
      primaryRole,
      roleIcon,
      roleDescription,
      outgoing: totalOutgoing,
      incoming: totalIncoming,
      typeCounts,
      connections: {
        amplifies: typeCounts.amplifies || 0,
        reduces: typeCounts.reduces || 0,
        constrains: typeCounts.constrains || 0,
        enables: typeCounts.enables || 0,
      },
    };
  };

  return (
    <SectionContainer
      title="Parameter Relationships"
      bgColor="transparent"
      className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg mb-8"
      horizPadding={true}
    >
      <div className="space-y-6">
        {/* Header Description */}

        <p className=" text-white">
          Shows how changing one parameter physically affects others.
          <span className="text-blue-300 font-medium"> Click any node</span> to
          see its downstream impacts and role.
        </p>

        {/* Two-column layout: Network Graph (left) and Info Panel (right) on >XS */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Network Graph - Left Side on sm+, bottom on mobile */}
          <div className="w-full sm:w-3/5 order-2 sm:order-1">
            <svg
              viewBox="0 20 400 360"
              className="w-full h-auto"
              role="img"
              aria-label="Parameter interaction network visualization"
              style={{
                isolation: "isolate",
              }}
            >
              {/* Network graph stage - rotating container */}
              <g
                className="network-graph-stage"
                transform={`rotate(${
                  (rotationOffset * 180) / Math.PI
                } 200 200)`}
                style={{
                  transition: "transform 1.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  willChange: "transform",
                }}
              >
                {/* Relationship edges layer */}
                <g className="relationship-layer">
                  {relationships.map((rel, index) => {
                    const from = paramPositions[rel.from];
                    const to = paramPositions[rel.to];

                    if (!from || !to) return null;

                    const isActive =
                      selectedParam === rel.from || selectedParam === rel.to;
                    const opacity =
                      selectedParam && !isActive ? 0.15 : isActive ? 0.9 : 0.6;

                    // Calculate arrow path
                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const unitX = dx / dist;
                    const unitY = dy / dist;

                    // Shorten line to stop at node edge (radius 40)
                    const startX = from.x + unitX * 40;
                    const startY = from.y + unitY * 40;
                    const endX = to.x - unitX * 45;
                    const endY = to.y - unitY * 45;

                    return (
                      <g
                        key={index}
                        className="relationship-edge"
                        data-type={rel.type}
                      >
                        {/* Connection line */}
                        <line
                          className="edge-line"
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke={getRelationshipColor(rel.type)}
                          strokeWidth={2}
                          opacity={opacity}
                          style={{
                            transition: "opacity 0.3s ease",
                          }}
                          onMouseEnter={() => setHoveredRelation(rel)}
                          onMouseLeave={() => setHoveredRelation(null)}
                        />

                        {/* Arrowhead */}
                        <polygon
                          className="edge-arrow"
                          points={`${endX},${endY} ${
                            endX - 8 * unitX + 5 * unitY
                          },${endY - 8 * unitY - 5 * unitX} ${
                            endX - 8 * unitX - 5 * unitY
                          },${endY - 8 * unitY + 5 * unitX}`}
                          fill={getRelationshipColor(rel.type)}
                          opacity={opacity}
                          style={{
                            transition: "opacity 0.3s ease",
                          }}
                        />
                      </g>
                    );
                  })}
                </g>

                {/* Parameter nodes layer */}
                <g className="parameter-nodes-layer">
                  {parameters.map((param) => {
                    const pos = paramPositions[param.id];
                    if (!pos) return null;

                    const isSelected = selectedParam === param.id;
                    const isConnected = connectedParams.has(param.id);
                    const isHovered = hoveredNode === param.id;
                    const isHighlighted =
                      isSelected || isConnected || isHovered;
                    const opacity = selectedParam && !isHighlighted ? 0.3 : 1;
                    const nodeColor = getNodeColor(param);

                    return (
                      <g
                        key={param.id}
                        className="parameter-node"
                        data-id={param.id}
                      >
                        {/* Glow effect for selected or hovered (during auto-cycle) */}
                        {(isSelected || isHovered) && (
                          <circle
                            className="node-glow animate-pulse"
                            cx={pos.x}
                            cy={pos.y}
                            r={45}
                            fill={nodeColor}
                            opacity={0.3}
                          />
                        )}

                        {/* Node circle */}
                        <circle
                          className="node-body"
                          cx={pos.x}
                          cy={pos.y}
                          r={35}
                          fill={nodeColor}
                          opacity={opacity}
                          onClick={() => handleNodeClick(param.id)}
                          onMouseEnter={() =>
                            !autoCycling && setHoveredNode(param.id)
                          }
                          onMouseLeave={() =>
                            !autoCycling && setHoveredNode(null)
                          }
                          style={{
                            transition: "opacity 0.3s ease, fill 0.3s ease",
                            cursor: "pointer",
                          }}
                        />

                        {/* Node label - counter-rotated to stay upright */}
                        <text
                          className="node-label"
                          x={pos.x}
                          y={pos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="500"
                          opacity={opacity}
                          transform={`rotate(${
                            -(rotationOffset * 180) / Math.PI
                          } ${pos.x} ${pos.y})`}
                          style={{
                            transition:
                              "opacity 0.3s ease, transform 1.8s cubic-bezier(0.4, 0, 0.2, 1)",
                            pointerEvents: "none",
                            willChange: "transform",
                          }}
                        >
                          {formatKeyAsTitle(param.id)
                            .split(" ")
                            .map((word, i, arr) => {
                              // Calculate vertical offset to center multi-line text
                              const totalLines = arr.length;
                              const lineHeight = 13;
                              const totalHeight = (totalLines - 1) * lineHeight;
                              const startOffset = -totalHeight / 2;

                              return (
                                <tspan
                                  key={i}
                                  className="label-line"
                                  x={pos.x}
                                  dy={i === 0 ? startOffset : lineHeight}
                                >
                                  {word}
                                </tspan>
                              );
                            })}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            </svg>
          </div>

          {/* Info Panel - Right Side on sm+, top on mobile */}
          <div className="parameter-info-panel w-full sm:w-2/5 order-1 sm:order-2 space-y-4">
            {/* Selected Parameter Card - Top of Stack */}
            {selectedParam &&
              (() => {
                const param = parameters.find((p) => p.id === selectedParam);
                const role = getParameterRole(selectedParam);
                const nodeColor = getNodeColor(param!);

                // Generate role-based description with connected parameter names
                const getRoleDescription = (): string => {
                  const outgoingRels = relationships.filter(
                    (rel) => rel.from === selectedParam
                  );
                  const incomingRels = relationships.filter(
                    (rel) => rel.to === selectedParam
                  );
                  const outgoing = outgoingRels.length;
                  const incoming = incomingRels.length;
                  const totalConnections = outgoing + incoming;

                  if (totalConnections === 0) {
                    return "Independent parameter with no direct connections.";
                  }

                  // Helper to format parameter names
                  const formatParamNames = (
                    rels: ParameterRelationship[],
                    isOutgoing: boolean
                  ): string => {
                    const ids = rels.map((r) => (isOutgoing ? r.to : r.from));
                    if (ids.length === 0) return "";
                    if (ids.length === 1) return formatKeyAsTitle(ids[0]);
                    if (ids.length === 2)
                      return `${formatKeyAsTitle(
                        ids[0]
                      )} and ${formatKeyAsTitle(ids[1])}`;
                    return `${formatKeyAsTitle(ids[0])}, ${formatKeyAsTitle(
                      ids[1]
                    )}, and ${ids.length - 2} more`;
                  };

                  // Build description based on role with parameter names
                  if (role.primaryRole === "Upstream Driver") {
                    const names = formatParamNames(outgoingRels, true);
                    return `Directly affects ${names}. Increase this to amplify downstream effects.`;
                  } else if (role.primaryRole === "Downstream Effect") {
                    const names = formatParamNames(incomingRels, false);
                    return `Controlled by ${names}. Adjust upstream parameters to change this.`;
                  } else if (role.primaryRole === "Hub") {
                    return `Central node with ${totalConnections} connections. Changes cascade through entire network.`;
                  } else if (role.primaryRole === "Risk Amplifier") {
                    const amplifyRels = outgoingRels.filter(
                      (r) => r.type === "amplifies"
                    );
                    const names = formatParamNames(amplifyRels, true);
                    return `Amplifies damage risk in ${names}. Keep low to maintain safety margins.`;
                  } else if (role.primaryRole === "Safety Control") {
                    const reduceRels = outgoingRels.filter(
                      (r) => r.type === "reduces"
                    );
                    const names = formatParamNames(reduceRels, true);
                    return `Reduces risk in ${names}. Increase this for safer operation.`;
                  } else if (role.primaryRole === "Bottleneck") {
                    const constrainRels = outgoingRels.filter(
                      (r) => r.type === "constrains"
                    );
                    const names = formatParamNames(constrainRels, true);
                    return `Limits ${names}. Adjust this first to expand available options.`;
                  } else if (role.primaryRole === "Enabler") {
                    const enableRels = outgoingRels.filter(
                      (r) => r.type === "enables"
                    );
                    const names = formatParamNames(enableRels, true);
                    return `Enables ${names}. Increase this to unlock more possibilities.`;
                  } else if (role.primaryRole === "Mediator") {
                    return `Bridge between ${incoming} inputs and ${outgoing} outputs. Balances competing influences.`;
                  } else {
                    return `Connected to ${totalConnections} parameter${
                      totalConnections !== 1 ? "s" : ""
                    } in network.`;
                  }
                };

                const isHovered = hoveredNode === selectedParam;
                // After user interaction, selected card should always be full opacity
                const cardOpacity = userInteracted ? 1 : isHovered ? 1 : 0.4;

                return (
                  <div
                    className="parameter-detail-card rounded-lg p-4 animate-fadeIn transition-colors duration-300"
                    style={{
                      backgroundColor: hexToRgba(nodeColor, cardOpacity),
                    }}
                  >
                    <h4 className="parameter-name text-base font-bold text-white">
                      {formatKeyAsTitle(selectedParam)}
                    </h4>
                    <p className="connection-description text-sm text-white/90 leading-relaxed">
                      {getRoleDescription()}
                    </p>
                  </div>
                );
              })()}

            {/* Connected Parameter Cards - Stacked Below in Clockwise Order */}
            {selectedParam &&
              (() => {
                // Get connected parameters and sort by their clockwise position
                const connectedRels = relationships.filter(
                  (rel) =>
                    rel.from === selectedParam || rel.to === selectedParam
                );

                // Sort by the index of the other parameter in the parameters array (clockwise order)
                const sortedRels = connectedRels.sort((a, b) => {
                  const aParamId = a.from === selectedParam ? a.to : a.from;
                  const bParamId = b.from === selectedParam ? b.to : b.from;
                  const aIndex = parameters.findIndex((p) => p.id === aParamId);
                  const bIndex = parameters.findIndex((p) => p.id === bParamId);
                  return aIndex - bIndex;
                });

                return sortedRels.map((rel, idx) => {
                  const isOutgoing = rel.from === selectedParam;
                  const otherParamId = isOutgoing ? rel.to : rel.from;
                  const otherParam = parameters.find(
                    (p) => p.id === otherParamId
                  );
                  const otherNodeColor = getNodeColor(otherParam!);
                  const relationColor = getRelationshipColor(rel.type);
                  const description = getRelationshipDescription(
                    rel.from,
                    rel.to,
                    rel.type,
                    rel.description
                  );
                  const isHovered = hoveredNode === otherParamId;

                  return (
                    <div
                      key={idx}
                      className="parameter-detail-card rounded-lg p-4 animate-fadeIn transition-colors duration-300 cursor-pointer"
                      style={{
                        backgroundColor: hexToRgba(
                          otherNodeColor,
                          isHovered ? 1 : 0.4
                        ),
                      }}
                      onClick={() => handleNodeClick(otherParamId)}
                    >
                      <h4 className="parameter-name text-base font-bold text-white">
                        {formatKeyAsTitle(otherParamId)}
                      </h4>
                      <p className="connection-description text-sm text-white/90 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  );
                });
              })()}

            {/* Hovered Relationship Info */}
            {hoveredRelation && (
              <div className="relationship-tooltip rounded-lg p-4 border border-blue-500/50 animate-fadeIn">
                <div className="tooltip-header flex items-center gap-2 mb-2">
                  <span className="tooltip-icon text-lg">
                    {getRelationshipIcon(hoveredRelation.type)}
                  </span>
                  <h4 className="tooltip-title text-sm font-semibold text-blue-300">
                    {hoveredRelation.type.charAt(0).toUpperCase() +
                      hoveredRelation.type.slice(1)}
                  </h4>
                </div>
                <div className="tooltip-description text-xs text-gray-300">
                  {hoveredRelation.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};
