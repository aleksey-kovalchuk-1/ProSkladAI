// src/pages/Dashboard/GoodsDetail/ReportsTab.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSeoHistory } from '@/api/seo';
import { getGoodsInfographics } from '@/api/infographics';
import type { GoodsItem } from '@/api/types';
import { Alert, Badge, Button } from '@/components/ui';
import { BarChart3 } from 'lucide-react';

interface ReportsTabProps {
  goodsItem: GoodsItem;
}

/**
 * Вкладка «Отчёты». Счётчики SEO-генераций и инфографики раньше читались из
 * состояния родителя, которое загружалось независимо от активной вкладки. После
 * разделения состояние живёт в своих вкладках, поэтому эта вкладка запрашивает
 * два счётчика сама — так сводка остаётся такой же, как до рефакторинга.
 */
const ReportsTab: React.FC<ReportsTabProps> = ({ goodsItem }) => {
  const navigate = useNavigate();
  const goodsId = goodsItem.id;

  const [seoCount, setSeoCount] = useState<number | null>(null);
  const [infographicsCount, setInfographicsCount] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadError(null);
      try {
        const [history, images] = await Promise.all([
          getSeoHistory(goodsId),
          getGoodsInfographics(goodsId),
        ]);
        if (cancelled) return;
        setSeoCount(history.length);
        setInfographicsCount(images.length);
      } catch (err: any) {
        if (cancelled) return;
        setLoadError(err?.message || 'Не удалось загрузить сводку по товару');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [goodsId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Отчёты по товару</h2>
        <Button onClick={() => navigate(`/reports?goods_id=${goodsId}`)}>
          <BarChart3 size={18} className="mr-2" aria-hidden="true" />
          Перейти к отчётам
        </Button>
      </div>

      {loadError && <Alert variant="error">{loadError}</Alert>}

      <p className="text-gray-500 dark:text-gray-400">
        Здесь будут отображаться сгенерированные отчёты для данного товара. Перейдите в раздел
        «Отчёты» для просмотра и создания новых.
      </p>

      {!loadError && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">SEO-генераций: {seoCount ?? '—'}</Badge>
          <Badge variant="neutral">Инфографики: {infographicsCount ?? '—'}</Badge>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
