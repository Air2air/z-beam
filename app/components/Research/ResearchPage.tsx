'use client';

import React, { useState } from 'react';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { Badge } from '../Badge/Badge';
import Link from 'next/link';
import { 
  InfoIcon, 
  TrendingUpIcon, 
  LayersIcon, 
  ZapIcon, 
  CheckCircleIcon, 
  FileTextIcon,
  DownloadIcon,
  BarChartIcon,
  AlertTriangleIcon,
  ChevronRightIcon
} from '@/app/components/Buttons';

interface ResearchPageProps {
  data: any;
  category: string;
  subcategory: string;
  materialSlug: string;
  property: string;
}

export function ResearchPage({ data, category: _category, subcategory: _subcategory, materialSlug: _materialSlug, property }: ResearchPageProps) {
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set([0]));
  const [expandedVariations, setExpandedVariations] = useState<Set<number>>(new Set());
  
  const toggleSource = (index: number) => {
    const newSet = new Set(expandedSources);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedSources(newSet);
  };
  
  const _toggleVariation = (index: number) => {
    const newSet = new Set(expandedVariations);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedVariations(newSet);
  };

  return (
    <div className="research-page">
      {/* Breadcrumb Navigation */}
      {data.breadcrumb && (
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 flex-wrap">
            {data.breadcrumb.map((item: any, index: number) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-tertiary">/</span>}
                <Link 
                  href={item.href}
                  className="text-blue-600400 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="primary">
            <FileTextIcon className="w-4 h-4" />
            {data.pageType === 'property-drill-down' ? 'Property Research' : 'Research'}
          </Badge>
          {data.research_version && (
            <Badge variant="secondary">v{data.research_version}</Badge>
          )}
        </div>
        
        {data.subtitle && (
          <p className="text-xl text-muted mb-6">
            {data.subtitle}
          </p>
        )}
      </div>

      {/* Primary Value Spotlight */}
      {data.research?.primary && (
        <SectionContainer
          title="Recommended Value"
          icon={<CheckCircleIcon className="w-6 h-6" />}
          bgColor="gray-50"
          horizPadding={true}
          radius={true}
        >
          <div className="bg-secondary rounded-md p-8 border-2 border-green-200800">
            <div className="grid-2col-md gap-8">
              <div>
                <div className="text-6xl font-bold text-green-600400 mb-4">
                  {data.research.primary.value}
                  <span className="text-3xl ml-2">{data.research.primary.unit}</span>
                </div>
                <div className="text-2xl text-muted mb-4">
                  ({data.research.primary.value_alt} {data.research.primary.unit_alt})
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="success">
                    {data.research.primary.confidence}% Confidence
                  </Badge>
                  <Badge variant="secondary">
                    {data.research.primary.source}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-lg text-secondary font-semibold mb-3 text-secondary">
                  Context & Application
                </h3>
                <p className="text-secondary mb-4">
                  {data.research.primary.notes}
                </p>
                {data.research.primary.citation && (
                  <div className="text-sm bg-blue-900/20 p-3 rounded border border-blue-200800">
                    <strong className="text-blue-900200">Source:</strong>{' '}
                    <a 
                      href={data.research.primary.citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600400 hover:underline"
                    >
                      {data.research.primary.citation.title}
                    </a>
                    {' '}({data.research.primary.citation.year})
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionContainer>
      )}

      {/* Research Sources - Interactive Cards */}
      {data.research?.sources && (
        <SectionContainer
          title={`Multi-Source Analysis (${data.research.sources.length} Sources)`}
          icon={<LayersIcon className="w-6 h-6" />}
          bgColor="gray-50"
          horizPadding={true}
          radius={true}
        >
          <div className="space-y-4">
            {data.research.sources.map((source: any, index: number) => (
              <div 
                key={index}
                className="bg-secondary rounded-md border overflow-hidden transition-all hover:shadow-lg"
              >
                <button
                  onClick={() => toggleSource(index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50:bg-primary transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-3xl font-bold text-blue-600400">
                        {source.value} {source.unit}
                      </span>
                      <Badge variant={source.confidence >= 97 ? 'success' : 'primary'}>
                        {source.confidence}% confidence
                      </Badge>
                      <Badge variant="secondary">
                        {source.source_type}
                      </Badge>
                    </div>
                    <p className="text-muted">
                      {source.source_name}
                    </p>
                  </div>
                  {expandedSources.has(index) ? (
                    <ChevronRightIcon className="w-6 h-6 text-muted" />
                  ) : (
                    <ChevronRightIcon className="w-6 h-6 text-muted" />
                  )}
                </button>
                
                {expandedSources.has(index) && (
                  <div className="p-6 pt-0 border-t">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-secondary">
                          Research Notes
                        </h4>
                        <p className="text-secondary">
                          {source.notes}
                        </p>
                      </div>
                      
                      {source.geological_context && (
                        <div className="bg-amber-50 p-4 rounded-md border border-amber-200800">
                          <h4 className="font-semibold text-secondary mb-2 text-secondary">
                            Geological Context
                          </h4>
                          <div className="grid-2col-md gap-3 text-sm">
                            <div>
                              <strong className="text-amber-800300">Formation:</strong>
                              <div className="text-secondary">
                                {source.geological_context.formation?.replace(/_/g, ' ')}
                              </div>
                            </div>
                            <div>
                              <strong className="text-amber-800300">Typical Locations:</strong>
                              <div className="text-secondary">
                                {source.geological_context.typical_locations}
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <strong className="text-amber-800300">Mineral Composition:</strong>
                              <div className="text-secondary">
                                {source.geological_context.mineral_composition}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {source.citation && (
                        <div className="bg-blue-900/20 p-4 rounded-md border border-blue-200800">
                          <h4 className="font-semibold text-secondary mb-2 text-secondary">
                            Citation
                          </h4>
                          <div className="text-sm">
                            {source.citation.author && (
                              <div><strong>Author:</strong> {source.citation.author}</div>
                            )}
                            <div><strong>Title:</strong> {source.citation.title}</div>
                            <div><strong>Publisher:</strong> {source.citation.publisher}</div>
                            <div><strong>Year:</strong> {source.citation.year}</div>
                            {source.citation.page && (
                              <div><strong>Pages:</strong> {source.citation.page}</div>
                            )}
                            {source.citation.url && (
                              <a 
                                href={source.citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600400 hover:underline inline-block mt-2"
                              >
                                View Source →
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionContainer>
      )}

      {/* Geological Variations */}
      {data.research?.geological_variations && (
        <SectionContainer
          title="Material Variations & Types"
          icon={<TrendingUpIcon className="w-6 h-6" />}
          bgColor="gray-100"
          horizPadding={true}
          radius={true}
        >
          <div className="grid-2col-md gap-6">
            {data.research.geological_variations.map((variation: any, index: number) => (
              <div 
                key={index}
                className="bg-secondary rounded-md border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl text-secondary font-bold mb-2">
                        {variation.variation_name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {variation.common_names?.map((name: string, i: number) => (
                          <Badge key={i} variant="secondary" size="sm">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600400">
                        {variation.density}
                      </div>
                      <div className="text-sm text-muted">{variation.unit}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-purple-900/20 p-3 rounded">
                      <div className="text-sm font-semibold text-purple-900200 mb-1">
                        Color
                      </div>
                      <div className="text-secondary">
                        {variation.color}
                      </div>
                    </div>
                    
                      {variation.mineral_composition && (
                      <div className="bg-tertiary p-3 rounded">
                        <div className="text-sm font-semibold text-muted mb-2">
                          Mineral Composition
                        </div>
                        <div className="grid-2col gap-2 text-xs">
                          {Object.entries(variation.mineral_composition).map(([mineral, percent]) => (
                            <div key={mineral} className="flex justify-between">
                              <span className="capitalize text-muted">
                                {mineral}:
                              </span>
                              <span className="font-semibold">
                                {String(percent)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}                    <div className="text-sm text-muted">
                      {variation.notes}
                    </div>
                    
                    {variation.typical_sources && (
                      <div className="text-xs text-muted">
                        <strong>Sources:</strong> {variation.typical_sources}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>
      )}

      {/* Laser Cleaning Implications */}
      {data.laser_implications && (
        <SectionContainer
          title="Laser Cleaning Parameter Optimization"
          icon={<ZapIcon className="w-6 h-6" />}
          bgColor="gray-50"
          horizPadding={true}
          radius={true}
        >
          <div className="space-y-6">
            {/* Summary */}
            {data.laser_implications.summary && (
              <div className="bg-yellow-900/20 p-6 rounded-md border border-yellow-200800">
                <div className="flex items-start gap-3">
                  <AlertTriangleIcon className="w-6 h-6 text-yellow-600400 flex-shrink-0 mt-1" />
                  <p className="text-primary">
                    {data.laser_implications.summary}
                  </p>
                </div>
              </div>
            )}
            
            {/* Parameter Recommendations */}
            {data.laser_implications.parameter_recommendations && (
              <div className="grid-2col-md gap-6">
                {Object.entries(data.laser_implications.parameter_recommendations).map(([param, details]: any) => (
                  <div 
                    key={param}
                    className="bg-secondary p-6 rounded-md border"
                  >
                    <h3 className="text-lg text-secondary font-semibold mb-3 capitalize text-secondary">
                      {param.replace(/_/g, ' ')}
                    </h3>
                    <div className="space-y-2">
                      {details.optimal !== undefined && (
                        <div className="flex justify-between items-center p-3 bg-green-900/20 rounded">
                          <span className="text-sm font-medium">Optimal</span>
                          <span className="text-xl font-bold text-green-600400">
                            {details.optimal} {details.unit}
                          </span>
                        </div>
                      )}
                      {details.range_min !== undefined && details.range_max !== undefined && (
                        <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded">
                          <span className="text-sm font-medium">Range</span>
                          <span className="font-semibold text-blue-600400">
                            {details.range_min} - {details.range_max} {details.unit}
                          </span>
                        </div>
                      )}
                      {details.reasoning && (
                        <p className="text-sm text-muted mt-3">
                          {details.reasoning}
                        </p>
                      )}
                      {details.density_scaling && (
                        <div className="text-xs text-purple-600400 bg-purple-900/20 p-2 rounded mt-2">
                          <strong>Scaling:</strong> {details.density_scaling}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Variation-Specific Impact */}
            {data.laser_implications.geological_variation_impact && (
              <div>
                <h3 className="text-xl text-secondary font-semibold mb-4 text-secondary">
                  Type-Specific Adjustments
                </h3>
                <div className="grid-2col-md gap-4">
                  {Object.entries(data.laser_implications.geological_variation_impact).map(([type, impact]: any) => (
                    <div 
                      key={type}
                      className="bg-secondary p-4 rounded-md border"
                    >
                      <h4 className="font-semibold mb-2 capitalize text-secondary">
                        {type.replace(/_/g, ' ')}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted">Density:</span>
                          <strong className="text-primary">{impact.density} kg/m³</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Power:</span>
                          <strong className="text-primary">{impact.recommended_power}W</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Fluence:</span>
                          <strong className="text-primary">{impact.recommended_fluence} J/cm²</strong>
                        </div>
                        <p className="text-muted mt-3">
                          {impact.notes}
                        </p>
                        {impact.special_considerations && (
                          <div className="bg-red-900/20 p-2 rounded border border-red-200800 text-red-700300">
                            <strong>⚠️ Important:</strong> {impact.special_considerations}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionContainer>
      )}

      {/* Comparative Analysis */}
      {data.comparative?.similar_materials && (
        <SectionContainer
          title="Material Comparison"
          icon={<BarChartIcon className="w-6 h-6" />}
          bgColor="gray-100"
          horizPadding={true}
          radius={true}
        >
          <div className="space-y-6">
            {/* Visual Comparison Bar */}
            <div className="bg-secondary p-6 rounded-md border">
              <h3 className="text-lg text-secondary font-semibold mb-4 text-secondary">
                Density Comparison Chart
              </h3>
              <div className="space-y-3">
                {data.comparative.similar_materials.map((material: any, index: number) => {
                  const percentage = ((material.density / data.research.primary.value) * 100);
                  const isHighlighted = material.name === data.material;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${isHighlighted ? 'text-blue-600400' : 'text-secondary'}`}>
                          {material.name}
                        </span>
                        <span className="text-sm text-muted">
                          {material.density} kg/m³
                        </span>
                      </div>
                      <div className="w-full bg-primary rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${
                            isHighlighted 
                              ? 'bg-blue-400' 
                              : 'bg-secondary'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted mt-1">
                        {material.difference} from baseline • {material.notes}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionContainer>
      )}

      {/* Research Methodology */}
      {data.methodology && (
        <SectionContainer
          title="Research Methodology"
          icon={<InfoIcon className="w-6 h-6" />}
          bgColor="gray-50"
          horizPadding={true}
          radius={true}
        >
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap">
              {data.methodology.research_process}
            </div>
            
            {data.methodology.quality_gates && (
              <div className="mt-8">
                <h3 className="text-xl text-secondary font-semibold mb-4 text-secondary">Quality Assurance</h3>
                <div className="grid-2col-md gap-4">
                  {data.methodology.quality_gates.map((gate: any, index: number) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-md border-2 ${
                        gate.status === 'passed' 
                          ? 'bg-green-900/20 border-green-500' 
                          : 'bg-red-900/20 border-red-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {gate.status === 'passed' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                        )}
                        <h4 className="font-semibold text-secondary">
                          {gate.name}
                        </h4>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted">Threshold:</span>
                          <strong>{gate.threshold}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Actual:</span>
                          <strong>{gate.actual}</strong>
                        </div>
                        <p className="text-muted mt-2">
                          {gate.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionContainer>
      )}

      {/* FAQ Section */}
      {data.faq && data.faq.length > 0 && (
        <SectionContainer
          title="Frequently Asked Questions"
          bgColor="transparent"
          horizPadding={true}
          radius={true}
        >
          <div className="space-y-6">
            {data.faq.map((item: any, index: number) => (
              <div 
                key={index}
                className="bg-secondary p-6 rounded-md border"
              >
                <h3 className="text-lg text-secondary font-semibold mb-3 text-secondary">
                  {item.question}
                </h3>
                <p className="text-secondary">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </SectionContainer>
      )}

      {/* Dataset Download */}
      {data.dataset?.enabled && (
        <SectionContainer
          title="Download Research Dataset"
          icon={<DownloadIcon className="w-6 h-6" />}
          bgColor="gray-100"
          horizPadding={true}
          radius={true}
        >
          <div className="bg-secondary p-6 rounded-md border">
            <p className="text-secondary mb-6">
              {data.dataset.description}
            </p>
            <div className="grid-3col-md gap-4 mb-6">
              {data.dataset.formats?.map((format: any, index: number) => (
                <div 
                  key={index}
                  className="p-4 bg-tertiary rounded-md border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-blue-600400">
                      {format.format}
                    </span>
                    <span className="text-sm text-muted">{format.size}</span>
                  </div>
                  <p className="text-sm text-muted mb-3">
                    {format.description}
                  </p>
                  <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center justify-center gap-2">
                    <DownloadIcon className="w-4 h-4" />
                    Download {format.format}
                  </button>
                </div>
              ))}
            </div>
            {data.dataset.license && (
              <div className="text-sm text-muted bg-tertiary p-4 rounded">
                <strong>License:</strong> {data.dataset.license.name} —{' '}
                {data.dataset.license.description}
              </div>
            )}
          </div>
        </SectionContainer>
      )}

      {/* Related Research Links */}
      {data.related_research && (
        <SectionContainer
          title="Related Research"
          bgColor="gray-50"
          horizPadding={true}
          radius={true}
        >
          <div className="grid-2col-md gap-6">
            {data.related_research.same_material && (
              <div>
                <h3 className="text-lg text-secondary font-semibold mb-3 text-secondary">
                  Other Properties for {data.material}
                </h3>
                <div className="space-y-2">
                  {data.related_research.same_material.map((item: any, index: number) => (
                    <Link
                      key={index}
                      href={item.url}
                      className="block p-4 bg-secondary rounded-md border hover:border-blue-500 transition-colors"
                    >
                      <div className="font-semibold text-blue-600400 mb-1">
                        {item.title}
                      </div>
                      <div className="text-sm text-muted">
                        {item.description}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {data.related_research.same_property && (
              <div>
                <h3 className="text-lg text-secondary font-semibold mb-3 text-secondary">
                  {property} for Other Materials
                </h3>
                <div className="space-y-2">
                  {data.related_research.same_property.map((item: any, index: number) => (
                    <Link
                      key={index}
                      href={item.url}
                      className="block p-4 bg-secondary rounded-md border hover:border-blue-500 transition-colors"
                    >
                      <div className="font-semibold text-blue-600400 mb-1">
                        {item.title}
                      </div>
                      <div className="text-sm text-muted">
                        {item.description}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionContainer>
      )}
    </div>
  );
}
