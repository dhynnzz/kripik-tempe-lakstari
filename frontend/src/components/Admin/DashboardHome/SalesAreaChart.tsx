import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../../services/api';

export type ChartPeriod = 'weekly' | 'monthly' | 'yearly';

interface SalesPoint {
  key: string;
  label: string;
  full_label: string;
  revenue: number;
  orders: number;
}

interface SalesSummary {
  total_revenue: number;
  total_orders: number;
  average_order: number;
  growth_rate: number;
  previous_revenue: number;
  highest_revenue: number;
  highest_label: string;
}

interface SalesAreaChartProps {
  refreshTrigger?: number;
}

export const SalesAreaChart: React.FC<SalesAreaChartProps> = ({ refreshTrigger = 0 }) => {
  const [period, setPeriod] = useState<ChartPeriod>('weekly');
  const [points, setPoints] = useState<SalesPoint[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch sales chart data from backend
  const fetchChartData = async (selectedPeriod: ChartPeriod) => {
    setLoading(true);
    try {
      const res = await apiService.getSalesChart(selectedPeriod);
      if (res && res.points) {
        setPoints(res.points);
        setSummary(res.summary);
      } else {
        setPoints([]);
        setSummary(null);
      }
    } catch (err) {
      console.error('Failed to load sales chart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(period);
  }, [period, refreshTrigger]);

  // Format IDR Currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Compact currency for Y-Axis labels (e.g., 500rb, 1jt, 2.5jt)
  const formatCompactRupiah = (num: number) => {
    if (num >= 1_000_000_000) {
      const val = (num / 1_000_000_000).toFixed(1).replace('.0', '');
      return `Rp ${val}M`;
    }
    if (num >= 1_000_000) {
      const val = (num / 1_000_000).toFixed(1).replace('.0', '');
      return `Rp ${val}jt`;
    }
    if (num >= 1_000) {
      const val = (num / 1_000).toFixed(0);
      return `Rp ${val}rb`;
    }
    return `Rp ${num}`;
  };

  // SVG Dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 68;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const baseY = svgHeight - paddingBottom;

  // Compute scale and points
  const maxVal = useMemo(() => {
    if (!points.length) return 100000;
    const maxRev = Math.max(...points.map((p) => p.revenue), 0);
    if (maxRev === 0) return 100000; // minimum ceiling
    // Round to clean ceiling
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxRev)));
    return Math.ceil((maxRev * 1.15) / magnitude) * magnitude;
  }, [points]);

  // Y-axis gridlines (4 steps: 0, 33%, 66%, 100%)
  const yTicks = useMemo(() => {
    return [0, maxVal * 0.33, maxVal * 0.66, maxVal].map((val) => ({
      val,
      y: baseY - (val / maxVal) * chartHeight,
      label: formatCompactRupiah(val),
    }));
  }, [maxVal, baseY, chartHeight]);

  // Compute coordinate coordinates (x, y)
  const chartCoordinates = useMemo(() => {
    if (!points.length) return [];
    const count = points.length;
    return points.map((p, idx) => {
      const x =
        count === 1
          ? paddingLeft + chartWidth / 2
          : paddingLeft + (idx / (count - 1)) * chartWidth;
      const y = baseY - (p.revenue / maxVal) * chartHeight;
      return { x, y, point: p, index: idx };
    });
  }, [points, chartWidth, chartHeight, paddingLeft, baseY, maxVal]);

  // Smooth Bezier Curve Line Path Generator
  const linePath = useMemo(() => {
    if (!chartCoordinates.length) return '';
    if (chartCoordinates.length === 1) {
      const p = chartCoordinates[0];
      return `M ${p.x},${p.y}`;
    }

    let line = `M ${chartCoordinates[0].x.toFixed(1)},${chartCoordinates[0].y.toFixed(1)}`;

    for (let i = 0; i < chartCoordinates.length - 1; i++) {
      const curr = chartCoordinates[i];
      const next = chartCoordinates[i + 1];
      const dx = next.x - curr.x;

      const cp1x = (curr.x + dx * 0.45).toFixed(1);
      const cp1y = curr.y.toFixed(1);
      const cp2x = (next.x - dx * 0.45).toFixed(1);
      const cp2y = next.y.toFixed(1);

      line += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
    }

    return line;
  }, [chartCoordinates]);

  // Mouse interaction for responsive hover detection
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !chartCoordinates.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * svgWidth;

    // Find nearest point
    let closestIdx = 0;
    let minDistance = Infinity;

    chartCoordinates.forEach((coord, idx) => {
      const dist = Math.abs(coord.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Touch interaction for mobile finger scrubbing
  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current || !chartCoordinates.length) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = touch.clientX - rect.left;
    const svgX = (clientX / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDistance = Infinity;

    chartCoordinates.forEach((coord, idx) => {
      const dist = Math.abs(coord.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setHoveredIndex(null);
    }, 2000);
  };

  const activeCoord = hoveredIndex !== null ? chartCoordinates[hoveredIndex] : null;

  // Decide X-axis labels to display to avoid cluttering on monthly (30 days)
  const displayLabels = useMemo(() => {
    if (!chartCoordinates.length) return [];
    if (period === 'weekly') {
      return chartCoordinates; // All 7 days
    }
    if (period === 'monthly') {
      // Show every 4th day plus last day
      return chartCoordinates.filter(
        (_, idx) => idx % 4 === 0 || idx === chartCoordinates.length - 1
      );
    }
    // Yearly: all 12 months
    return chartCoordinates;
  }, [chartCoordinates, period]);

  return (
    <div className="dh-chart-panel">
      {/* ── Top Bar: Title & Period Filter Dropdown ── */}
      <div className="dh-chart-top">
        <div className="dh-chart-title-wrap">
          <span className="dh-chart-title-label">Grafik Penjualan</span>
          <h2 className="dh-chart-heading">
            {summary ? formatRupiah(summary.total_revenue) : 'Rp 0'}
          </h2>
          <p className="dh-chart-sub">
            {period === 'weekly' && 'Omset 7 hari terakhir'}
            {period === 'monthly' && 'Omset 30 hari terakhir'}
            {period === 'yearly' && 'Omset tahun berjalan (12 Bulan)'}
            {' • '}
            <strong style={{ color: 'var(--text-main)' }}>
              {summary?.total_orders || 0} Transaksi Lunas
            </strong>
          </p>
        </div>

        {/* ── Period Dropdown ── */}
        <div className="dh-period-dropdown-wrap">
          <svg
            className="dh-dropdown-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <select
            className="dh-period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as ChartPeriod)}
            aria-label="Pilih Periode Penjualan"
          >
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
          <svg
            className="dh-dropdown-chevron"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* ── Main Chart Canvas ── */}
      <div className="dh-chart-canvas-container">
        {loading ? (
          <div className="dh-chart-loading">
            <div className="dh-chart-spinner"></div>
            <span>Memuat data grafik penjualan...</span>
          </div>
        ) : points.length === 0 ? (
          <div className="dh-chart-empty">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
            <p>Belum ada data penjualan pada periode ini.</p>
          </div>
        ) : (
          <div className="dh-svg-wrapper">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="dh-sales-svg"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchMove}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <defs>
                {/* Ambient Stroke Glow Filter */}
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Horizontal Reference Grid Lines & Y-Labels */}
              {yTicks.map((tick, i) => (
                <g key={`ytick-${i}`} className="dh-grid-group">
                  <line
                    x1={paddingLeft}
                    y1={tick.y}
                    x2={svgWidth - paddingRight}
                    y2={tick.y}
                    className="dh-grid-line"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={tick.y + 3.5}
                    textAnchor="end"
                    className="dh-ytick-text"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {/* X-Axis Horizontal Base Line */}
              <line
                x1={paddingLeft}
                y1={baseY}
                x2={svgWidth - paddingRight}
                y2={baseY}
                className="dh-axis-line"
              />

              {/* Smooth Spline Curve Line with Glow */}
              {linePath && (
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  d={linePath}
                  fill="none"
                  stroke="#FAAC30"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#goldGlow)"
                />
              )}

              {/* Data Points (Dots on chart) */}
              {chartCoordinates.map((coord, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <g key={`dot-${idx}`}>
                    {/* Outer glow ring when hovered */}
                    {isHovered && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="9"
                        fill="rgba(250, 172, 48, 0.25)"
                        className="dh-pulse-ring"
                      />
                    )}
                    {/* Core Point Dot */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isHovered ? 5.5 : period === 'monthly' ? 2.5 : 3.8}
                      fill={isHovered ? '#FAAC30' : '#ffffff'}
                      stroke="#FAAC30"
                      strokeWidth={isHovered ? 3 : 2}
                      className="dh-chart-dot"
                    />
                  </g>
                );
              })}

              {/* Active Crosshair Vertical Guide Line */}
              {activeCoord && (
                <line
                  x1={activeCoord.x}
                  y1={paddingTop}
                  x2={activeCoord.x}
                  y2={baseY}
                  className="dh-crosshair-line"
                />
              )}

              {/* X-Axis Labels */}
              {displayLabels.map((coord, idx) => (
                <text
                  key={`xlabel-${idx}`}
                  x={coord.x}
                  y={baseY + 20}
                  textAnchor="middle"
                  className={`dh-xtick-text ${hoveredIndex === coord.index ? 'is-active-label' : ''
                    }`}
                >
                  {coord.point.label}
                </text>
              ))}
            </svg>

            {/* Floating Glassmorphism Tooltip */}
            <AnimatePresence>
              {activeCoord && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="dh-chart-tooltip"
                  style={{
                    left: `${(activeCoord.x / svgWidth) * 100}%`,
                    top: `${(activeCoord.y / svgHeight) * 100}%`,
                    transform: `translate(${activeCoord.index === 0
                        ? '-15%'
                        : activeCoord.index === chartCoordinates.length - 1
                          ? '-85%'
                          : '-50%'
                      }, -125%)`,
                  }}
                >
                  <div className="dh-tooltip-header">
                    <span className="dh-tooltip-date">
                      {activeCoord.point.full_label}
                    </span>
                  </div>
                  <div className="dh-tooltip-body">
                    <div className="dh-tooltip-row">
                      <span className="dh-tooltip-label">Penjualan:</span>
                      <strong className="dh-tooltip-rev">
                        {formatRupiah(activeCoord.point.revenue)}
                      </strong>
                    </div>
                    <div className="dh-tooltip-row">
                      <span className="dh-tooltip-label">Pesanan:</span>
                      <span className="dh-tooltip-orders">
                        {activeCoord.point.orders} Pesanan Selesai
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Bottom Mini Insight Footer ── */}
      {summary && summary.highest_revenue > 0 && (
        <div className="dh-chart-footer">
          <div className="dh-footer-insight">
            <span>
              Puncak omset tertinggi diraih pada{' '}
              <strong>{summary.highest_label}</strong> dengan nominal{' '}
              <strong>{formatRupiah(summary.highest_revenue)}</strong>. Rata-rata per transaksi:{' '}
              <strong>{formatRupiah(summary.average_order)}</strong>.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
