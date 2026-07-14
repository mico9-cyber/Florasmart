import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppData';
import { Grid, Trash2, Plus, Star, Save, RefreshCw, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { gardenPlanService } from '../services/gardenPlanService';
import { recommendationService } from '../services/recommendationService';
import { formatCurrency } from '../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

const EMPTY_PLANTS = [];

function resolveRows(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function resolveObject(payload) {
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  return payload || {};
}

function plantEmoji(product) {
  const type = String(product?.productType || '').toUpperCase();
  if (type === 'FLOWER') return '🌸';
  if (type === 'PLANT') return '🌿';
  return '🌱';
}

function productColor(product) {
  return product?.color || (String(product?.productType || '').toUpperCase() === 'FLOWER' ? '#F43F5E' : '#22C55E');
}

export default function GardenPlannerPage() {
  const { products, refreshAppData } = useContext(AppContext);
  const { t } = useTranslation();

  const plantOptions = useMemo(() => {
    const livePlants = products
      .filter((item) => item.category === 'plants' && Number(item.stock || 0) > 0)
      .map((item) => ({
        id: item.backendId || item.id,
        name: item.name,
        color: item.color || '#22C55E',
        emoji: plantEmoji(item),
        price: Number(item.price || 0),
      }));
    return livePlants.length > 0 ? livePlants : EMPTY_PLANTS;
  }, [products]);

  const [plans, setPlans] = useState([]);
  const [summary, setSummary] = useState({});
  const [currentPlan, setCurrentPlan] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [selectedCellIndex, setSelectedCellIndex] = useState(0);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [cellSoilType, setCellSoilType] = useState('');
  const [cellSunExposure, setCellSunExposure] = useState('');
  const [cellNotes, setCellNotes] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('task');
  const [planRecommendations, setPlanRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPlannerData = async (targetPlanId = null) => {
    setLoading(true);
    setError('');
    try {
      let planList = resolveRows(await gardenPlanService.list());
      if (planList.length === 0) {
        const created = resolveObject(await gardenPlanService.create({
          name: 'My Garden Plan',
          description: 'Primary FloraSmart garden layout',
          width: 8,
          height: 8,
        }));
        planList = [created];
      }

      const summaryData = resolveObject(await gardenPlanService.summary());
      const nextPlanId = targetPlanId || summaryData.defaultPlanId || planList.find((plan) => plan.isDefault)?.id || planList[0]?.id;
      const planDetails = resolveObject(await gardenPlanService.getById(nextPlanId));
      const planNotes = resolveRows(await gardenPlanService.listNotes(nextPlanId));

      setPlans(planList);
      setSummary(summaryData);
      setCurrentPlan(planDetails);
      setNotes(planNotes);
      setPlanName(planDetails.name || '');
      setPlanDescription(planDetails.description || '');
      setPlanRecommendations([]);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlannerData();
  }, []);

  useEffect(() => {
    if (!selectedPlantId && plantOptions.length > 0) {
      setSelectedPlantId(plantOptions[0].id);
    }
  }, [plantOptions, selectedPlantId]);

  const selectedPlant = useMemo(
    () => plantOptions.find((plant) => String(plant.id) === String(selectedPlantId)) || plantOptions[0] || null,
    [plantOptions, selectedPlantId]
  );

  const planDimensions = {
    width: Number(currentPlan?.width || 8),
    height: Number(currentPlan?.height || 8),
  };

  const gridState = useMemo(() => {
    const totalCells = planDimensions.width * planDimensions.height;
    const cells = Array(totalCells).fill(null);
    const metaMap = new Map();

    (currentPlan?.cells || []).forEach((cell) => {
      metaMap.set(`${cell.row}-${cell.col}`, cell);
    });

    (currentPlan?.placements || []).forEach((placement) => {
      const index = (placement.row * planDimensions.width) + placement.col;
      if (index < 0 || index >= totalCells) return;
      cells[index] = {
        placementId: placement.id,
        productId: placement.productId,
        row: placement.row,
        col: placement.col,
        name: placement.product?.name || 'Garden Plant',
        color: productColor(placement.product),
        emoji: plantEmoji(placement.product),
        datePlanted: placement.plantedAt ? new Date(placement.plantedAt).toISOString().substring(0, 10) : new Date(placement.createdAt || Date.now()).toISOString().substring(0, 10),
      };
    });

    return { cells, metaMap };
  }, [currentPlan, planDimensions.width, planDimensions.height]);

  const selectedCell = useMemo(() => {
    const row = Math.floor(selectedCellIndex / planDimensions.width);
    const col = selectedCellIndex % planDimensions.width;
    const meta = gridState.metaMap.get(`${row}-${col}`) || null;
    return { row, col, meta };
  }, [gridState, planDimensions.width, selectedCellIndex]);

  useEffect(() => {
    setCellSoilType(selectedCell.meta?.soilType || '');
    setCellSunExposure(selectedCell.meta?.sunExposure || '');
    setCellNotes(selectedCell.meta?.notes || '');
  }, [selectedCellIndex, currentPlan?.id]);

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const syncPlanner = async (planId = currentPlan?.id) => {
    await loadPlannerData(planId);
    if (typeof refreshAppData === 'function') {
      await refreshAppData().catch(() => undefined);
    }
  };

  const handleCellClick = async (idx) => {
    if (!currentPlan) return;
    setSelectedCellIndex(idx);
    setError('');
    const row = Math.floor(idx / planDimensions.width);
    const col = idx % planDimensions.width;
    const existing = gridState.cells[idx];

    try {
      setSaving(true);
      if (existing?.placementId) {
        await gardenPlanService.removePlacement(currentPlan.id, existing.placementId);
        showSuccess(t('gardenPlannerPage.toast.cellCleared', { index: idx + 1 }));
      } else {
        if (!selectedPlant) {
          setError(t('gardenPlannerPage.validation.choosePlantFirst'));
          return;
        }
        await gardenPlanService.addPlacement(currentPlan.id, {
          productId: selectedPlant.id,
          row,
          col,
          quantity: 1,
          notes: `Placed from planner using ${selectedPlant.name}`,
          plantedAt: new Date().toISOString(),
        });
        showSuccess(t('gardenPlannerPage.toast.plantPlaced', { name: selectedPlant.name, index: idx + 1 }));
      }
      await syncPlanner(currentPlan.id);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToPlace'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetGrid = async () => {
    if (!currentPlan || !window.confirm('Are you sure you want to clear your entire greenhouse grid?')) return;
    try {
      setSaving(true);
      await Promise.all((currentPlan.placements || []).map((placement) => gardenPlanService.removePlacement(currentPlan.id, placement.id)));
      showSuccess(t('gardenPlannerPage.toast.gridCleared'));
      await syncPlanner(currentPlan.id);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToClearGrid'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlanName.trim()) {
      setError(t('gardenPlannerPage.validation.planNameRequired'));
      return;
    }
    try {
      setSaving(true);
      const created = resolveObject(await gardenPlanService.create({
        name: newPlanName.trim(),
        description: 'Garden plan created from the planner workspace',
        width: 8,
        height: 8,
      }));
      setNewPlanName('');
      showSuccess(t('gardenPlannerPage.toast.planCreated'));
      await syncPlanner(created.id);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToCreatePlan'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlan = async () => {
    if (!currentPlan) return;
    try {
      setSaving(true);
      await gardenPlanService.update(currentPlan.id, {
        name: planName.trim(),
        description: planDescription.trim(),
        width: planDimensions.width,
        height: planDimensions.height,
      });
      showSuccess(t('gardenPlannerPage.toast.planDetailsSaved'));
      await syncPlanner(currentPlan.id);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToSavePlan'));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultPlan = async () => {
    if (!currentPlan) return;
    try {
      setSaving(true);
      await gardenPlanService.setDefault(currentPlan.id);
      showSuccess(t('gardenPlannerPage.toast.defaultPlanUpdated'));
      await syncPlanner(currentPlan.id);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToSetDefault'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!currentPlan || !window.confirm(`Delete ${currentPlan.name}?`)) return;
    try {
      setSaving(true);
      await gardenPlanService.remove(currentPlan.id);
      showSuccess(t('gardenPlannerPage.toast.planDeleted'));
      await loadPlannerData();
      if (typeof refreshAppData === 'function') {
        await refreshAppData().catch(() => undefined);
      }
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToDeletePlan'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCellConfig = async () => {
    if (!currentPlan) return;
    try {
      setSaving(true);
      if (!cellSoilType.trim() && !cellSunExposure.trim() && !cellNotes.trim()) {
        await gardenPlanService.removeCell(currentPlan.id, selectedCell.row, selectedCell.col);
        showSuccess(t('gardenPlannerPage.toast.cellMetadataCleared', { index: selectedCellIndex + 1 }));
      } else {
        await gardenPlanService.updateCell(currentPlan.id, selectedCell.row, selectedCell.col, {
          soilType: cellSoilType.trim() || null,
          sunExposure: cellSunExposure.trim() || null,
          notes: cellNotes.trim() || null,
        });
        showSuccess(t('gardenPlannerPage.toast.cellMetadataSaved', { index: selectedCellIndex + 1 }));
      }
      await syncPlanner(currentPlan.id);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToSaveCell'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!currentPlan) return;
    if (!noteTitle.trim() || !noteContent.trim()) {
      setError(t('gardenPlannerPage.validation.noteFieldsRequired'));
      return;
    }
    try {
      setSaving(true);
      await gardenPlanService.addNote(currentPlan.id, {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        noteType,
      });
      setNoteTitle('');
      setNoteContent('');
      setNoteType('task');
      showSuccess(t('gardenPlannerPage.toast.noteSaved'));
      await syncPlanner(currentPlan.id);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToSaveNote'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = async (note) => {
    const nextTitle = window.prompt('Update note title', note.title);
    if (nextTitle === null) return;
    const nextContent = window.prompt('Update note content', note.content);
    if (nextContent === null) return;
    try {
      setSaving(true);
      await gardenPlanService.updateNote(currentPlan.id, note.id, {
        title: nextTitle.trim(),
        content: nextContent.trim(),
        noteType: note.noteType || 'general',
      });
      showSuccess(t('gardenPlannerPage.toast.noteUpdated'));
      await syncPlanner(currentPlan.id);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToUpdateNote'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!currentPlan || !window.confirm('Delete this note?')) return;
    try {
      setSaving(true);
      await gardenPlanService.removeNote(currentPlan.id, noteId);
      showSuccess(t('gardenPlannerPage.toast.noteDeleted'));
      await syncPlanner(currentPlan.id);
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToDeleteNote'));
    } finally {
      setSaving(false);
    }
  };

  const handleRecommendPlan = async () => {
    if (!currentPlan) return;
    try {
      setRecommendLoading(true);
      setError('');
      const payload = resolveObject(await recommendationService.gardenPlan({ gardenPlanId: currentPlan.id }));
      setPlanRecommendations(payload.recommendations || []);
      showSuccess(t('gardenPlannerPage.toast.recommendationsLoaded'));
    } catch (err) {
      setError(err.message || t('gardenPlannerPage.toast.failedToLoadRecommendations'));
    } finally {
      setRecommendLoading(false);
    }
  };

  return (
    <div style={styles.container} className="container">
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Grid size={28} color="var(--accent-lime)" />
        </div>
        <h1 style={styles.title}>{t('gardenPlannerPage.title')}</h1>
        <p style={styles.subtitle}>
          {t('gardenPlannerPage.subtitle')}
        </p>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}
      {success && <div style={styles.successBanner}>{success}</div>}

      <div style={styles.summaryGrid}>
        <div className="card" style={styles.summaryCard}><strong>{summary.totalPlans || plans.length || 0}</strong><span>{t('gardenPlannerPage.totalPlans')}</span></div>
        <div className="card" style={styles.summaryCard}><strong>{summary.totalPlacements || currentPlan?.placementCount || 0}</strong><span>{t('gardenPlannerPage.plantPlacements')}</span></div>
        <div className="card" style={styles.summaryCard}><strong>{summary.totalNotes || notes.length || 0}</strong><span>{t('gardenPlannerPage.savedNotes')}</span></div>
        <div className="card" style={styles.summaryCard}><strong>{summary.totalCells || currentPlan?.cellCount || 0}</strong><span>{t('gardenPlannerPage.configuredCells')}</span></div>
      </div>

      <div style={styles.layout}>
        <div style={styles.controlCol}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}>{t('gardenPlannerPage.gardenPlans')}</h3>
            <p style={styles.hint}>{t('gardenPlannerPage.gardenPlansHint')}</p>
            <FormInput
              label={t('gardenPlannerPage.currentPlan')}
              id="garden-plan-select"
              type="select"
              value={currentPlan?.id || ''}
              onChange={(e) => loadPlannerData(e.target.value)}
              options={plans.map((plan) => ({ value: plan.id, label: `${plan.name}${plan.isDefault ? ' (Default)' : ''}` }))}
            />
            <FormInput label={t('gardenPlannerPage.planName')} id="plan-name" value={planName} onChange={(e) => setPlanName(e.target.value)} />
            <FormInput label={t('gardenPlannerPage.description')} id="plan-description" value={planDescription} onChange={(e) => setPlanDescription(e.target.value)} />
            <div style={styles.inlineButtons}>
              <Button variant="secondary" onClick={handleSavePlan} disabled={saving} icon={<Save size={14} />}>{t('gardenPlannerPage.savePlan')}</Button>
              <Button variant="secondary" onClick={handleSetDefaultPlan} disabled={saving} icon={<Star size={14} />}>{t('gardenPlannerPage.setDefault')}</Button>
              <Button variant="secondary" onClick={handleDeletePlan} disabled={saving} icon={<Trash2 size={14} />}>{t('gardenPlannerPage.delete')}</Button>
            </div>
            <form onSubmit={handleCreatePlan} style={{ marginTop: '16px' }}>
              <FormInput label={t('gardenPlannerPage.newPlan')} id="new-plan-name" placeholder={t('gardenPlannerPage.newPlanPlaceholder')} value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} />
              <Button type="submit" variant="lime" style={{ width: '100%' }} disabled={saving}>
                <Plus size={16} /> {t('gardenPlannerPage.createPlan')}
              </Button>
            </form>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}>{t('gardenPlannerPage.selectPlantVariety')}</h3>
            <p style={styles.hint}>{t('gardenPlannerPage.selectPlantVarietyHint')}</p>
            <div style={styles.plantsList}>
              {plantOptions.map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => setSelectedPlantId(plant.id)}
                  style={{
                    ...styles.plantOption,
                    borderColor: String(selectedPlantId) === String(plant.id) ? 'var(--accent-lime)' : 'var(--border-green)',
                    backgroundColor: String(selectedPlantId) === String(plant.id) ? 'rgba(132, 204, 22, 0.05)' : 'var(--bg-darker)'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{plant.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: 0, color: 'var(--text-white)' }}>{plant.name}</h5>
                    <span style={{ fontSize: '11px', color: plant.color, fontWeight: '700' }}>{formatCurrency(plant.price || 0)}</span>
                  </div>
                  <div style={{ ...styles.colorDot, backgroundColor: plant.color }}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}>{t('gardenPlannerPage.cellConfiguration')}</h3>
            <p style={styles.hint}>{t('gardenPlannerPage.cellConfigurationHint')}</p>
            <FormInput
              label={t('gardenPlannerPage.selectedCell')}
              id="selected-cell"
              type="select"
              value={selectedCellIndex}
              onChange={(e) => setSelectedCellIndex(Number(e.target.value))}
              options={Array.from({ length: planDimensions.width * planDimensions.height }, (_, idx) => ({ value: idx, label: `Cell #${idx + 1}` }))}
            />
            <FormInput label={t('gardenPlannerPage.soilType')} id="soil-type" placeholder={t('gardenPlannerPage.soilTypePlaceholder')} value={cellSoilType} onChange={(e) => setCellSoilType(e.target.value)} />
            <FormInput
              label={t('gardenPlannerPage.sunExposure')}
              id="sun-exposure"
              type="select"
              value={cellSunExposure}
              onChange={(e) => setCellSunExposure(e.target.value)}
              options={[
                { value: '', label: t('gardenPlannerPage.selectSunlight') },
                { value: 'full sun', label: t('gardenPlannerPage.fullSun') },
                { value: 'partial shade', label: t('gardenPlannerPage.partialShade') },
                { value: 'bright indirect light', label: t('gardenPlannerPage.brightIndirectLight') },
                { value: 'low light', label: t('gardenPlannerPage.lowLight') },
              ]}
            />
            <FormInput label={t('gardenPlannerPage.cellNotes')} id="cell-notes" placeholder={t('gardenPlannerPage.cellNotesPlaceholder')} value={cellNotes} onChange={(e) => setCellNotes(e.target.value)} />
            <Button variant="secondary" onClick={handleSaveCellConfig} style={{ width: '100%' }} disabled={saving}>
              <Save size={16} /> {t('gardenPlannerPage.saveCellDetails')}
            </Button>
          </div>

          <div className="card">
            <h3 style={styles.sectionTitle}>{t('gardenPlannerPage.gardenNotes')}</h3>
            <p style={styles.hint}>{t('gardenPlannerPage.gardenNotesHint')}</p>
            <form onSubmit={handleAddNote}>
              <FormInput label={t('gardenPlannerPage.noteTitle')} id="note-title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required />
              <FormInput label={t('gardenPlannerPage.noteContent')} id="note-content" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} required />
              <FormInput
                label={t('gardenPlannerPage.noteType')}
                id="note-type"
                type="select"
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                options={[
                  { value: 'task', label: t('gardenPlannerPage.task') },
                  { value: 'reminder', label: t('gardenPlannerPage.reminder') },
                  { value: 'observation', label: t('gardenPlannerPage.observation') },
                  { value: 'idea', label: t('gardenPlannerPage.idea') },
                  { value: 'general', label: t('gardenPlannerPage.general') },
                ]}
              />
              <Button type="submit" variant="lime" style={{ width: '100%' }} disabled={saving}>
                <Plus size={16} /> {t('gardenPlannerPage.saveNote')}
              </Button>
            </form>
            <div style={styles.notesList}>
              {notes.length > 0 ? notes.map((note) => (
                <div key={note.id} style={styles.noteCard}>
                  <div>
                    <strong style={{ color: 'var(--text-white)' }}>{note.title}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--accent-lime)', textTransform: 'capitalize' }}>{note.noteType || 'general'}</div>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>{note.content}</p>
                  </div>
                  <div style={styles.noteActions}>
                    <button type="button" style={styles.linkBtn} onClick={() => handleEditNote(note)}>{t('common.edit')}</button>
                    <button type="button" style={styles.linkBtnDanger} onClick={() => handleDeleteNote(note.id)}>{t('common.delete')}</button>
                  </div>
                </div>
              )) : <div style={styles.emptyPanel}>{t('gardenPlannerPage.noNotesSaved')}</div>}
            </div>
          </div>
        </div>

        <div style={styles.gridCol}>
          <div className="card" style={{ height: '100%' }}>
            <div style={styles.gridHeader}>
              <div>
                <h3 style={{ color: 'var(--text-white)' }}>{t('gardenPlannerPage.greenhouseFloorLayout')}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('gardenPlannerPage.clickToPlaceOrClear', { name: selectedPlant?.name || 'a plant' })}
                </span>
              </div>
              <div style={styles.inlineButtons}>
                <Button onClick={() => loadPlannerData(currentPlan?.id)} variant="secondary" icon={<RefreshCw size={16} />} disabled={loading || saving}>
                  {t('gardenPlannerPage.refresh')}
                </Button>
                <Button onClick={handleResetGrid} variant="secondary" icon={<Trash2 size={16} />} disabled={saving || loading}>
                  {t('gardenPlannerPage.clear')}
                </Button>
                <Button onClick={handleRecommendPlan} variant="lime" icon={<Sparkles size={16} />} disabled={recommendLoading || !currentPlan}>
                  {recommendLoading ? t('gardenPlannerPage.analyzing') : t('gardenPlannerPage.aiPlanSuggestions')}
                </Button>
              </div>
            </div>

            {loading ? (
              <div style={styles.emptyPanel}>{t('gardenPlannerPage.loadingGardenPlanner')}</div>
            ) : (
              <>
                <div className="planner-grid" style={{ ...styles.dynamicGrid, gridTemplateColumns: `repeat(${planDimensions.width}, minmax(0, 1fr))` }}>
                  {gridState.cells.map((cell, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCellClick(idx)}
                      className={`planner-cell ${cell ? 'occupied' : ''}`}
                      style={{
                        backgroundColor: cell ? `${cell.color}25` : '',
                        borderColor: selectedCellIndex === idx ? 'var(--accent-lime)' : cell ? cell.color : '',
                        boxShadow: selectedCellIndex === idx ? '0 0 0 1px var(--accent-lime) inset' : 'none',
                      }}
                      title={cell ? `${cell.name} (Planted: ${cell.datePlanted})` : `Cell #${idx + 1}`}
                    >
                      {cell ? <span style={{ fontSize: '18px' }}>{cell.emoji || '🌱'}</span> : idx + 1}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '32px' }}>
                  <h4 style={{ color: 'var(--text-white)', marginBottom: '12px' }}>{t('gardenPlannerPage.greenhouseSpecimenRecords')}</h4>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>{t('gardenPlannerPage.coordinate')}</th>
                          <th>{t('gardenPlannerPage.specimenName')}</th>
                          <th>{t('gardenPlannerPage.datePlanted')}</th>
                          <th>{t('gardenPlannerPage.cellNotesHeader')}</th>
                          <th>{t('gardenPlannerPage.action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gridState.cells.some((cell) => cell !== null) ? (
                          gridState.cells.map((cell, idx) => {
                            if (!cell) return null;
                            const row = Math.floor(idx / planDimensions.width);
                            const col = idx % planDimensions.width;
                            const meta = gridState.metaMap.get(`${row}-${col}`) || null;
                            return (
                              <tr key={idx}>
                                <td style={{ fontWeight: 'bold' }}>Cell #{idx + 1}</td>
                                <td>{cell.name}</td>
                                <td>{cell.datePlanted}</td>
                                <td>{meta?.notes || t('gardenPlannerPage.noSavedCellNote')}</td>
                                <td>
                                  <button type="button" onClick={() => handleCellClick(idx)} style={styles.clearCellBtn}>
                                    {t('gardenPlannerPage.clear')}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                              {t('gardenPlannerPage.noPlantsMapped')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <h4 style={{ color: 'var(--text-white)', marginBottom: '12px' }}>{t('gardenPlannerPage.aiGardenSuggestions')}</h4>
                  {planRecommendations.length > 0 ? (
                    <div style={styles.recommendationList}>
                      {planRecommendations.map((rec) => (
                        <div key={rec.product.id} style={styles.recommendationCard}>
                          <div>
                            <div style={{ color: 'var(--text-white)', fontWeight: 700 }}>{rec.rank}. {rec.product.name}</div>
                            <div style={{ color: 'var(--accent-lime)', fontSize: '12px' }}>{t('gardenPlannerPage.scoreLabel', { score: rec.score })}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>{(rec.reasons || []).join(' • ')}</div>
                          </div>
                          <div style={{ color: 'var(--btn-yellow)', fontWeight: 700 }}>{formatCurrency(rec.product.price || 0)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyPanel}>{t('gardenPlannerPage.runAiSuggestionsHint')}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px 24px' },
  header: { textAlign: 'center', marginBottom: '32px' },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  title: { fontSize: '32px', fontWeight: '800', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
  summaryCard: { display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px' },
  layout: { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  controlCol: { flex: '1 0 320px' },
  gridCol: { flex: '2.2 0 520px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700' },
  hint: { color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 16px' },
  plantsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  plantOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-green)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  colorDot: { width: '12px', height: '12px', borderRadius: '50%' },
  inlineButtons: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  gridHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  dynamicGrid: { marginTop: '24px' },
  clearCellBtn: { background: 'none', border: 'none', color: 'var(--error)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  notesList: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' },
  noteCard: { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-darker)' },
  noteActions: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' },
  linkBtn: { background: 'none', border: 'none', color: 'var(--accent-lime)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  linkBtnDanger: { background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  recommendationList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  recommendationCard: { display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-darker)', alignItems: 'center' },
  emptyPanel: { marginTop: '16px', padding: '18px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-darker)', color: 'var(--text-muted)' },
  errorBanner: { marginBottom: '16px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-light)' },
  successBanner: { marginBottom: '16px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success)', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--text-light)' },
};
