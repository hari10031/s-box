import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { borderRadius } from '../theme/spacing';

const MIN_SCALE = 1;
const MAX_SCALE = 6;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getDistance = (touches) => {
  if (touches.length < 2) return 0;
  const [a, b] = touches;
  const dx = a.pageX - b.pageX;
  const dy = a.pageY - b.pageY;
  return Math.sqrt(dx * dx + dy * dy);
};

export default function ZoomableImageModal({
  visible,
  imageUri,
  onClose,
  title = 'Image Preview',
  subtitle = 'Pinch, pan, or double-tap to inspect details',
}) {
  const { width, height } = useWindowDimensions();
  const imageFrameHeight = Math.max(320, height * 0.78);
  const [scale, setScale] = useState(MIN_SCALE);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const scaleRef = useRef(MIN_SCALE);
  const panRef = useRef({ x: 0, y: 0 });
  const startScaleRef = useRef(MIN_SCALE);
  const startPanRef = useRef({ x: 0, y: 0 });
  const startDistanceRef = useRef(0);
  const lastTapRef = useRef(0);
  const gestureModeRef = useRef('idle');

  const setZoomScale = (nextScale) => {
    const safeScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    scaleRef.current = safeScale;
    setScale(safeScale);
  };

  const getClampedPan = (nextPan, nextScale = scaleRef.current) => {
    if (nextScale <= MIN_SCALE) return { x: 0, y: 0 };
    const maxX = ((width * nextScale) - width) / 2;
    const maxY = ((imageFrameHeight * nextScale) - imageFrameHeight) / 2;
    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    };
  };

  const setImagePan = (nextPan, nextScale = scaleRef.current) => {
    const safePan = getClampedPan(nextPan, nextScale);
    panRef.current = safePan;
    setPan(safePan);
  };

  const resetZoom = () => {
    setZoomScale(MIN_SCALE);
    setImagePan({ x: 0, y: 0 }, MIN_SCALE);
  };

  const toggleZoom = () => {
    if (scaleRef.current > 1.05) {
      resetZoom();
      return;
    }
    const nextScale = 2.5;
    setZoomScale(nextScale);
    setImagePan({ x: 0, y: 0 }, nextScale);
  };

  const stepZoom = (delta) => {
    const nextScale = clamp(scaleRef.current + delta, MIN_SCALE, MAX_SCALE);
    setZoomScale(nextScale);
    setImagePan(panRef.current, nextScale);
  };

  useEffect(() => {
    if (visible) resetZoom();
  }, [visible, imageUri]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (event) =>
        event.nativeEvent.touches.length > 1 || scaleRef.current > MIN_SCALE,
      onPanResponderGrant: (event) => {
        const touches = event.nativeEvent.touches;
        startScaleRef.current = scaleRef.current;
        startPanRef.current = panRef.current;

        if (touches.length >= 2) {
          gestureModeRef.current = 'pinch';
          startDistanceRef.current = getDistance(touches);
        } else {
          gestureModeRef.current = 'tap';
          startDistanceRef.current = 0;
        }
      },
      onPanResponderMove: (event, gestureState) => {
        const touches = event.nativeEvent.touches;

        if (touches.length >= 2) {
          const distance = getDistance(touches);
          if (!startDistanceRef.current || !distance) return;
          gestureModeRef.current = 'pinch';
          const nextScale = clamp(
            startScaleRef.current * (distance / startDistanceRef.current),
            MIN_SCALE,
            MAX_SCALE,
          );
          setZoomScale(nextScale);
          setImagePan(panRef.current, nextScale);
          return;
        }

        if (scaleRef.current > MIN_SCALE) {
          gestureModeRef.current = 'pan';
          setImagePan({
            x: startPanRef.current.x + gestureState.dx,
            y: startPanRef.current.y + gestureState.dy,
          });
        }
      },
      onPanResponderRelease: (_event, gestureState) => {
        const moved = Math.abs(gestureState.dx) + Math.abs(gestureState.dy);
        const now = Date.now();

        if (scaleRef.current <= 1.02) resetZoom();

        if (gestureModeRef.current !== 'pinch' && moved < 10) {
          if (now - lastTapRef.current < 280) {
            toggleZoom();
            lastTapRef.current = 0;
          } else {
            lastTapRef.current = now;
          }
        }

        gestureModeRef.current = 'idle';
      },
      onPanResponderTerminate: () => {
        if (scaleRef.current <= 1.02) resetZoom();
        gestureModeRef.current = 'idle';
      },
    }),
    [width, imageFrameHeight],
  );

  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.stage} {...panResponder.panHandlers}>
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.image,
              {
                width,
                height: imageFrameHeight,
                transform: [
                  { scale },
                  { translateX: pan.x },
                  { translateY: pan.y },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={() => stepZoom(-0.5)} activeOpacity={0.75}>
              <Ionicons name="remove" size={18} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => stepZoom(0.5)} activeOpacity={0.75}>
              <Ionicons name="add" size={18} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={resetZoom} activeOpacity={0.75}>
              <Ionicons name="refresh" size={16} color={colors.white} />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: { flex: 1 },
  title: { color: colors.white, fontSize: 16, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.62)', fontSize: 12, marginTop: 3 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    backgroundColor: colors.black,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  zoomText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  resetText: { color: colors.white, fontSize: 13, fontWeight: '700' },
});
