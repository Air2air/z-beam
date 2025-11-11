// app/components/ParameterNetwork/ParameterNetwork.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { formatKeyAsTitle } from '@/app/utils/metricsCardHelpers';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import type { 
  NetworkParameter, 
  ParameterRelationship, 
  ParameterNetworkProps,
  RelationshipType 
} from '@/types/centralized';

/**
 * Pre-filled relationship descriptions for clarity
 * Key format: "from_to_type"
 */
const RELATIONSHIP_DESCRIPTIONS: Record<string, string> = {
  // Power relationships
  'powerRange_pulseWidth_amplifies': 'More power means higher peak intensity. Too much can damage the material.',
  'powerRange_pulseDuration_amplifies': 'More power means higher peak intensity. Too much can damage the material.',
  'powerRange_energyDensity_amplifies': 'Higher power delivers more energy per pulse, removing more material.',
  'powerRange_fluence_amplifies': 'Higher power delivers more energy per pulse, removing more material.',
  'powerRange_spotSize_constrains': 'Same power in a smaller spot creates much higher energy density.',
  
  // Pulse width/duration relationships
  'pulseWidth_energyDensity_amplifies': 'Longer pulses let more heat build up in the material.',
  'pulseDuration_energyDensity_amplifies': 'Longer pulses let more heat build up in the material.',
  'pulseWidth_fluence_amplifies': 'Longer pulses deliver more total energy and heat goes deeper.',
  'pulseDuration_fluence_amplifies': 'Longer pulses deliver more total energy and heat goes deeper.',
  
  // Repetition rate relationships
  'repetitionRate_scanSpeed_constrains': 'Faster pulses mean you need to scan faster to maintain spacing.',
  'frequency_scanSpeed_constrains': 'Faster pulses mean you need to scan faster to maintain spacing.',
  'repetitionRate_overlapRatio_enables': 'More pulses per second lets you overlap more at the same speed.',
  'repetitionRate_overlap_enables': 'More pulses per second lets you overlap more at the same speed.',
  'frequency_overlapRatio_enables': 'More pulses per second lets you overlap more at the same speed.',
  'frequency_overlap_enables': 'More pulses per second lets you overlap more at the same speed.',
  
  // Scan speed relationships
  'scanSpeed_overlapRatio_reduces': 'Scanning faster means less overlap between pulses.',
  'scanSpeed_overlap_reduces': 'Scanning faster means less overlap between pulses.',
  
  // Overlap and pass count relationships
  'overlapRatio_passCount_reduces': 'Better overlap in each pass means fewer total passes needed.',
  'overlap_passCount_reduces': 'Better overlap in each pass means fewer total passes needed.',
  'overlapRatio_passes_reduces': 'Better overlap in each pass means fewer total passes needed.',
  'overlap_passes_reduces': 'Better overlap in each pass means fewer total passes needed.',
  'passCount_powerRange_reduces': 'Using more passes means you can use lower power and still get the job done.',
  'passes_powerRange_reduces': 'Using more passes means you can use lower power and still get the job done.',
  
  // Spot size relationships
  'spotSize_scanSpeed_enables': 'A bigger spot lets you scan faster while keeping good coverage.',
  'spotSize_overlapRatio_constrains': 'Smaller spots need slower scanning to maintain overlap.',
  'spotSize_overlap_constrains': 'Smaller spots need slower scanning to maintain overlap.',
  'spotSize_energyDensity_constrains': 'Smaller spots concentrate energy into a smaller area.',
  'spotSize_fluence_constrains': 'Smaller spots concentrate energy into a smaller area.',
  
  // Energy density relationships
  'energyDensity_passCount_reduces': 'Higher energy per pulse might let you do fewer passes, but risks damage.',
  'energyDensity_passes_reduces': 'Higher energy per pulse might let you do fewer passes, but risks damage.',
  'fluence_passCount_reduces': 'Higher energy per pulse might let you do fewer passes, but risks damage.',
  'fluence_passes_reduces': 'Higher energy per pulse might let you do fewer passes, but risks damage.',
  
  // Wavelength relationships
  'wavelength_energyDensity_amplifies': 'The right wavelength gets absorbed better, making energy transfer more efficient.',
  'wavelength_fluence_amplifies': 'The right wavelength gets absorbed better, making energy transfer more efficient.',
};

/**
 * Get clear, concise description for a relationship
 */
const getRelationshipDescription = (from: string, to: string, type: string, fallback: string): string => {
  const key = `${from}_${to}_${type}`;
  return RELATIONSHIP_DESCRIPTIONS[key] || fallback;
};

/**
 * Force-directed network graph showing parameter interdependencies
 * Automatically derives material-specific relationships from parameter data
 */
export const ParameterNetwork: React.FC<ParameterNetworkProps> = ({ parameters, materialName }) => {
  // Derive material-specific relationships from parameter data
  const relationships: ParameterRelationship[] = useMemo(() => {
    const relations: ParameterRelationship[] = [];
    
    // Helper to find parameter by ID
    const findParam = (id: string) => parameters.find(p => p.id === id);
    
    // POWER-BASED RELATIONSHIPS
    const power = findParam('powerRange');
    const pulse = findParam('pulseWidth') || findParam('pulseDuration');
    const energy = findParam('energyDensity') || findParam('fluence');
    const spot = findParam('spotSize');
    
    if (power && pulse) {
      const isPulseCritical = pulse.criticality === 'critical' || pulse.criticality === 'high';
      relations.push({
        from: 'powerRange',
        to: pulse.id,
        type: 'amplifies',
        strength: isPulseCritical ? 'strong' : 'moderate',
        description: getRelationshipDescription(
          'powerRange',
          pulse.id,
          'amplifies',
          `Higher power with ${pulse.name.toLowerCase()} determines peak intensity.`
        ),
      });
    }
    
    if (power && energy) {
      relations.push({
        from: 'powerRange',
        to: energy.id,
        type: 'amplifies',
        strength: 'strong',
        description: getRelationshipDescription(
          'powerRange',
          energy.id,
          'amplifies',
          `Power directly controls ${energy.name.toLowerCase()}.`
        ),
      });
    }
    
    if (power && spot) {
      relations.push({
        from: 'powerRange',
        to: 'spotSize',
        type: 'constrains',
        strength: 'strong',
        description: getRelationshipDescription(
          'powerRange',
          'spotSize',
          'constrains',
          'Power density = Power / Spot Area.'
        ),
      });
    }
    
    // PULSE WIDTH/DURATION RELATIONSHIPS
    if (pulse && energy) {
      const mechanism = pulse.material_interaction?.mechanism || '';
      const isThermalConfined = mechanism.toLowerCase().includes('thermal') || 
                                 mechanism.toLowerCase().includes('confined');
      relations.push({
        from: pulse.id,
        to: energy.id,
        type: 'amplifies',
        strength: isThermalConfined ? 'strong' : 'moderate',
        description: getRelationshipDescription(
          pulse.id,
          energy.id,
          'amplifies',
          'Pulse duration affects energy coupling.'
        ),
      });
    }
    
    // REPETITION RATE RELATIONSHIPS
    const repRate = findParam('repetitionRate') || findParam('frequency');
    const scanSpeed = findParam('scanSpeed');
    const overlap = findParam('overlapRatio') || findParam('overlap');
    
    if (repRate && scanSpeed) {
      const isHighCriticality = repRate.criticality === 'critical' || repRate.criticality === 'high';
      relations.push({
        from: 'repetitionRate',
        to: 'scanSpeed',
        type: 'constrains',
        strength: isHighCriticality ? 'strong' : 'moderate',
        description: getRelationshipDescription(
          repRate.id,
          'scanSpeed',
          'constrains',
          'Pulse spacing = Scan speed / Rep rate.'
        ),
      });
    }
    
    if (repRate && overlap) {
      relations.push({
        from: 'repetitionRate',
        to: overlap.id,
        type: 'enables',
        strength: 'strong',
        description: getRelationshipDescription(
          repRate.id,
          overlap.id,
          'enables',
          'Higher rep rate enables greater overlap at same scan speed.'
        ),
      });
    }
    
    // SCAN SPEED RELATIONSHIPS  
    if (scanSpeed && overlap) {
      relations.push({
        from: 'scanSpeed',
        to: overlap.id,
        type: 'reduces',
        strength: 'strong',
        description: getRelationshipDescription(
          'scanSpeed',
          overlap.id,
          'reduces',
          'Faster scanning reduces pulse overlap.'
        ),
      });
    }
    
    // OVERLAP & PASS COUNT RELATIONSHIPS
    const passCount = findParam('passCount') || findParam('passes');
    if (overlap && passCount) {
      relations.push({
        from: overlap.id,
        to: passCount.id,
        type: 'reduces',
        strength: 'moderate',
        description: getRelationshipDescription(
          overlap.id,
          passCount.id,
          'reduces',
          'Higher overlap reduces needed passes.'
        ),
      });
    }
    
    if (passCount && power) {
      relations.push({
        from: passCount.id,
        to: 'powerRange',
        type: 'reduces',
        strength: 'moderate',
        description: getRelationshipDescription(
          passCount.id,
          'powerRange',
          'reduces',
          'Multiple passes allow lower power per pass.'
        ),
      });
    }
    
    // SPOT SIZE RELATIONSHIPS
    if (spot && scanSpeed) {
      relations.push({
        from: 'spotSize',
        to: 'scanSpeed',
        type: 'enables',
        strength: 'moderate',
        description: getRelationshipDescription(
          'spotSize',
          'scanSpeed',
          'enables',
          'Larger spots enable faster scanning for same overlap.'
        ),
      });
    }
    
    if (spot && energy) {
      relations.push({
        from: 'spotSize',
        to: energy.id,
        type: 'constrains',
        strength: 'strong',
        description: getRelationshipDescription(
          'spotSize',
          energy.id,
          'constrains',
          'Fluence = Energy / (π × (Spot/2)²). Spot size determines energy density.'
        ),
      });
    }
    
    // WAVELENGTH RELATIONSHIPS (if present)
    const wavelength = findParam('wavelength');
    if (wavelength && energy) {
      const hasSelectiveAbsorption = wavelength.rationale?.toLowerCase().includes('selective') ||
                                      wavelength.rationale?.toLowerCase().includes('absorption');
      if (hasSelectiveAbsorption) {
        relations.push({
          from: 'wavelength',
          to: energy.id,
          type: 'amplifies',
          strength: 'moderate',
          description: 'Wavelength determines absorption efficiency. Higher absorption increases effective energy coupling.',
        });
      }
    }
    
    // Remove duplicate relationships and filter out self-references
    const uniqueRelations = relations.filter((rel, index, self) => 
      index === self.findIndex(r => r.from === rel.from && r.to === rel.to) &&
      rel.from !== rel.to &&
      findParam(rel.from) && findParam(rel.to) // Ensure both parameters exist
    );
    
    return uniqueRelations;
  }, [parameters]);

  // Find the most connected parameter as default selection
  const getDefaultSelection = useMemo(() => {
    if (parameters.length === 0) return null;
    
    // Count connections for each parameter
    const connectionCounts = parameters.map(param => {
      const outgoing = relationships.filter(rel => rel.from === param.id).length;
      const incoming = relationships.filter(rel => rel.to === param.id).length;
      return {
        id: param.id,
        connections: outgoing + incoming
      };
    });
    
    // Return parameter with most connections (or first if tie)
    const sorted = connectionCounts.sort((a, b) => b.connections - a.connections);
    return sorted[0]?.id || parameters[0].id;
  }, [parameters, relationships]);

  const [selectedParam, setSelectedParam] = useState<string | null>(getDefaultSelection);
  const [hoveredRelation, setHoveredRelation] = useState<ParameterRelationship | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Layout parameters in a circle
  const centerX = 200;
  const centerY = 200;
  const radius = 130;
  
  // Calculate rotation offset to position selected node at top
  const rotationOffset = useMemo(() => {
    if (!selectedParam) return 0;
    const selectedIndex = parameters.findIndex(p => p.id === selectedParam);
    if (selectedIndex === -1) return 0;
    // Calculate the base angle of the selected node (same formula as baseAngle below)
    const selectedBaseAngle = (selectedIndex / parameters.length) * 2 * Math.PI - Math.PI / 2;
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
      case 'amplifies': return '#EF4444'; // red - increases risk
      case 'reduces': return '#10B981'; // green - reduces risk
      case 'constrains': return '#F59E0B'; // amber - limits options
      case 'enables': return '#3B82F6'; // blue - opens possibilities
      default: return '#6B7280';
    }
  };

  const getRelationshipIcon = (type: RelationshipType): string => {
    switch (type) {
      case 'amplifies': return '⚠️';
      case 'reduces': return '✓';
      case 'constrains': return '🔒';
      case 'enables': return '🔓';
      default: return '•';
    }
  };

  const getCriticalityColor = (criticality: NetworkParameter['criticality']): string => {
    switch (criticality) {
      case 'critical': return '#DC2626';
      case 'high': return '#F97316';
      case 'medium': return '#FBBF24';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getDominantRelationshipType = (paramId: string): RelationshipType | null => {
    const outgoing = relationships.filter(rel => rel.from === paramId);
    if (outgoing.length === 0) return null;
    
    // Count relationship types
    const counts = outgoing.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Return most common type
    return Object.entries(counts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0] as RelationshipType;
  };

  const getNodeColor = (param: NetworkParameter): string => {
    const dominantType = getDominantRelationshipType(param.id);
    if (!dominantType) return '#6B7280';
    return getRelationshipColor(dominantType);
  };

  const getConnectedParams = (paramId: string): Set<string> => {
    const connected = new Set<string>();
    relationships.forEach(rel => {
      if (rel.from === paramId) connected.add(rel.to);
      if (rel.to === paramId) connected.add(rel.from);
    });
    return connected;
  };

  const connectedParams = selectedParam ? getConnectedParams(selectedParam) : new Set();

  // Analyze role of selected parameter
  const getParameterRole = (paramId: string) => {
    const outgoing = relationships.filter(rel => rel.from === paramId);
    const incoming = relationships.filter(rel => rel.to === paramId);
    
    // Count relationship types (outgoing only for role determination)
    const typeCounts = outgoing.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalOutgoing = outgoing.length;
    const totalIncoming = incoming.length;
    const totalConnections = totalOutgoing + totalIncoming;
    
    // Determine primary role based on outgoing relationships
    let primaryRole = 'Independent';
    let roleIcon = '🔷';
    let roleDescription = 'No significant connections';
    
    if (totalOutgoing === 0 && totalIncoming > 0) {
      primaryRole = 'Downstream Effect';
      roleIcon = '⬇️';
      roleDescription = 'Primarily affected by other parameters';
    } else if (totalOutgoing > 0 && totalIncoming === 0) {
      primaryRole = 'Upstream Driver';
      roleIcon = '⬆️';
      roleDescription = 'Primarily affects other parameters';
    } else if (totalConnections >= 5) {
      primaryRole = 'Hub';
      roleIcon = '🌐';
      roleDescription = 'Highly interconnected with many parameters';
    } else if (typeCounts.amplifies && typeCounts.amplifies >= totalOutgoing * 0.5) {
      primaryRole = 'Risk Amplifier';
      roleIcon = '⚠️';
      roleDescription = 'Increases damage potential downstream';
    } else if (typeCounts.reduces && typeCounts.reduces >= totalOutgoing * 0.5) {
      primaryRole = 'Safety Control';
      roleIcon = '✓';
      roleDescription = 'Reduces risk in connected parameters';
    } else if (typeCounts.constrains && typeCounts.constrains >= totalOutgoing * 0.5) {
      primaryRole = 'Bottleneck';
      roleIcon = '🔒';
      roleDescription = 'Limits options for other parameters';
    } else if (typeCounts.enables && typeCounts.enables >= totalOutgoing * 0.5) {
      primaryRole = 'Enabler';
      roleIcon = '🔓';
      roleDescription = 'Opens possibilities for other parameters';
    } else if (totalOutgoing > 0 && totalIncoming > 0) {
      primaryRole = 'Mediator';
      roleIcon = '⚖️';
      roleDescription = 'Balances incoming and outgoing influences';
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
      }
    };
  };

  return (
    <SectionContainer 
      title="Parameter Interaction"
      bgColor="transparent"
      className="card-background rounded-lg"
    >
      <div className="space-y-6">
        {/* Header Description */}
        <div>
          {materialName && (
            <div className="text-blue-400 text-lg font-medium mb-2">
              {materialName}
            </div>
          )}
          <p className="text-sm text-gray-400">
            Shows how changing one parameter physically affects others. 
            <span className="text-blue-300 font-medium"> Click any node</span> to see its downstream impacts and role.
          </p>
          {relationships.length > 0 && (
            <div className="mt-2 text-xs text-green-400">
              ✓ {relationships.length} physics-based relationship{relationships.length !== 1 ? 's' : ''} identified from parameter data
            </div>
          )}
        </div>

        {/* Info Panel - Full Width at Top */}
        <div className="space-y-4">
          {/* Selected Parameter Info with Role Analysis */}
          {selectedParam && (() => {
            const param = parameters.find(p => p.id === selectedParam);
            const role = getParameterRole(selectedParam);
            const nodeColor = getNodeColor(param!);
            
            return (
              <div className="rounded-lg p-6 border border-purple-500/50 animate-fadeIn">
                {/* Selected Parameter Header */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: nodeColor }}
                  >
                    {role.roleIcon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-1">
                      {formatKeyAsTitle(selectedParam)}
                    </h4>
                    <div className="text-sm text-gray-400">
                      {param?.value}{param?.unit} • {param?.criticality} criticality • {role.primaryRole}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Connections</div>
                    <div className="text-2xl font-bold text-white">{role.outgoing + role.incoming}</div>
                  </div>
                </div>

                {/* Connected Nodes - Colored Sections */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-400 mb-3">
                    Connected Parameters
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {relationships
                      .filter(rel => rel.from === selectedParam || rel.to === selectedParam)
                      .map((rel, idx) => {
                        const isOutgoing = rel.from === selectedParam;
                        const otherParamId = isOutgoing ? rel.to : rel.from;
                        const otherParam = parameters.find(p => p.id === otherParamId);
                        const otherNodeColor = getNodeColor(otherParam!);
                        const relationColor = getRelationshipColor(rel.type);
                        
                        return (
                          <div 
                            key={idx} 
                            className="rounded-lg p-4 border-l-4 border transition-all hover:scale-[1.02]"
                            style={{ 
                              borderLeftColor: relationColor,
                              backgroundColor: `${otherNodeColor}15`
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div 
                                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                                style={{ backgroundColor: otherNodeColor }}
                              >
                                {formatKeyAsTitle(otherParamId).split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-white">
                                    {formatKeyAsTitle(otherParamId)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {isOutgoing ? '→' : '←'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded" style={{ 
                                    backgroundColor: `${relationColor}30`,
                                    color: relationColor 
                                  }}>
                                    {getRelationshipIcon(rel.type)} {rel.type}
                                  </span>
                                  <span className="text-xs text-gray-500">{rel.strength}</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                  {rel.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Hovered Relationship Info */}
          {hoveredRelation && (
            <div className="rounded-lg p-4 border border-blue-500/50 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getRelationshipIcon(hoveredRelation.type)}</span>
                <h4 className="text-sm font-semibold text-blue-300">
                  {hoveredRelation.type.charAt(0).toUpperCase() + hoveredRelation.type.slice(1)}
                </h4>
              </div>
              <div className="text-xs text-gray-300">
                {hoveredRelation.description}
              </div>
            </div>
          )}
        </div>

        {/* Network Graph - Full Width */}
        <div className="w-full max-w-full sm:max-w-[60%] mx-auto">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-auto"
            role="img"
            aria-label="Parameter interaction network visualization"
            style={{
              isolation: 'isolate'
            }}
          >
            {/* Network graph stage - rotating container */}
            <g
              className="network-graph-stage"
              transform={`rotate(${(rotationOffset * 180) / Math.PI} 200 200)`}
              style={{
                transition: 'transform 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform'
              }}
            >
              {/* Relationship edges layer */}
              <g className="relationship-layer">
                {relationships.map((rel, index) => {
                const from = paramPositions[rel.from];
                const to = paramPositions[rel.to];
                
                if (!from || !to) return null;

                const isActive = selectedParam === rel.from || selectedParam === rel.to;
                const opacity = selectedParam && !isActive ? 0.15 : isActive ? 0.9 : 0.6;
                
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
                  <g key={index} className="relationship-edge" data-type={rel.type}>
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
                        transition: 'opacity 0.3s ease'
                      }}
                      onMouseEnter={() => setHoveredRelation(rel)}
                      onMouseLeave={() => setHoveredRelation(null)}
                    />
                    
                    {/* Arrowhead */}
                    <polygon
                      className="edge-arrow"
                      points={`${endX},${endY} ${endX - 8 * unitX + 5 * unitY},${endY - 8 * unitY - 5 * unitX} ${endX - 8 * unitX - 5 * unitY},${endY - 8 * unitY + 5 * unitX}`}
                      fill={getRelationshipColor(rel.type)}
                      opacity={opacity}
                      style={{ 
                        transition: 'opacity 0.3s ease'
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
                const isHighlighted = isSelected || isConnected || isHovered;
                const opacity = selectedParam && !isHighlighted ? 0.4 : 1;
                const nodeColor = getNodeColor(param);

                return (
                  <g key={param.id} className="parameter-node" data-id={param.id}>
                    {/* Glow effect for selected */}
                    {isSelected && (
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
                      onClick={() => setSelectedParam(selectedParam === param.id ? null : param.id)}
                      onMouseEnter={() => setHoveredNode(param.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ 
                        transition: 'opacity 0.3s ease, fill 0.3s ease',
                        cursor: 'pointer'
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
                      transform={`rotate(${-(rotationOffset * 180) / Math.PI} ${pos.x} ${pos.y})`}
                      style={{ 
                        transition: 'opacity 0.3s ease, transform 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: 'none',
                        willChange: 'transform'
                      }}
                    >
                      {formatKeyAsTitle(param.id).split(' ').map((word, i, arr) => {
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
      </div>
    </SectionContainer>
  );
};
