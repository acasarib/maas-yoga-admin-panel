import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Box, Typography, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import paymentsService from '../../services/paymentsService';
import { COLORS } from '../../constants';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const BalancePieChart = ({ currentPeriod, dateField = 'operativeResult' }) => {
  const [dataType, setDataType] = useState('income'); // 'income' or 'expense'
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState([]);

  // Fetch payments when period changes
  useEffect(() => {
    if (!currentPeriod || !currentPeriod.from || !currentPeriod.to) {
      return;
    }

    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const query = `${dateField} between ${currentPeriod.from}:${currentPeriod.to}`;
        const data = await paymentsService.getForChart(query);
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments for chart:', error);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [currentPeriod, dateField]);

  useEffect(() => {
    if (!payments || payments.length === 0) {
      setChartData(null);
      return;
    }

    // Filter payments based on dataType (income/expense)
    const filteredPayments = payments.filter(payment => {
      const value = payment.value || 0;
      return dataType === 'income' ? value > 0 : value < 0;
    });

    if (filteredPayments.length === 0) {
      setChartData(null);
      return;
    }

    // Group by category
    const categoryGroups = {};
    let total = 0;

    filteredPayments.forEach(payment => {
      const value = Math.abs(payment.value || 0); // Use absolute value
      total += value;

      // Determine category name (article) - group by category, not by individual items
      let categoryName = "Sin categoría";
      
      // Priority 1: item with category (article) - use the category/article name
      if (payment.item && payment.item.category && payment.item.category.title) {
        categoryName = payment.item.category.title;
      } 
      // Priority 2: item exists but no category loaded - still try to get category
      else if (payment.item && !payment.item.category) {
        categoryName = "Sin categoría";
      }
      // Priority 3: only itemId exists (object not loaded) - can't determine category
      else if (payment.itemId) {
        categoryName = "Sin categoría";
      }
      // Priority 4: course (with or without object loaded)
      else if (payment.courseId || payment.course) {
        categoryName = "Cursos";
      }
      // Priority 5: clazz (with or without object loaded)
      else if (payment.clazzId || payment.clazz) {
        categoryName = "Clases";
      }

      if (!categoryGroups[categoryName]) {
        categoryGroups[categoryName] = 0;
      }
      categoryGroups[categoryName] += value;
    });

    // Prepare chart data
    const labels = Object.keys(categoryGroups).sort();
    const data = labels.map(label => categoryGroups[label]);
    const percentages = labels.map(label => 
      ((categoryGroups[label] / total) * 100).toFixed(1)
    );

    // Generate colors
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#C9CBCF',
      '#4BC0C0',
      '#FF9F40'
    ];

    setChartData({
      labels,
      datasets: [
        {
          label: dataType === 'income' ? 'Ingresos' : 'Egresos',
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color),
          borderWidth: 1,
          percentages
        }
      ]
    });
  }, [payments, dataType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = context.dataset.percentages[context.dataIndex];
            return `${label}: $${value.toLocaleString('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} (${percentage}%)`;
          }
        }
      }
    }
  };

  const handleDataTypeChange = (event, newDataType) => {
    if (newDataType !== null) {
      setDataType(newDataType);
    }
  };

  return (
    <div style={{
      backgroundColor: COLORS.primary[50],
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 3px 5px rgba(0,0,0,0.1)',
      height: '100%'
    }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Distribución por Rubros
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <ToggleButtonGroup
            value={dataType}
            exclusive
            onChange={handleDataTypeChange}
            size="small"
            color="primary"
          >
            <ToggleButton value="income">
              Ingresos
            </ToggleButton>
            <ToggleButton value="expense">
              Egresos
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ height: 400, position: 'relative' }}>
        {chartData ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%' 
            }}
          >
            <Typography color="text.secondary">
              No hay datos para mostrar
            </Typography>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default BalancePieChart;
