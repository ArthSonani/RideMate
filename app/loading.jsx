import React from "react";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={`${styles.logo} ${styles.skeletonAvatar}`} />
          <h1 style={{ opacity: 0 }}>RideMate</h1>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.skeletonLine} style={{ width: "60%", height: 32 }} />
          <div
            className={styles.skeletonLine}
            style={{ width: "85%", height: 16, marginTop: 12 }}
          />

          <div className={styles.searchForm} style={{ marginTop: 20 }}>
            <div className={styles.skeletonLine} style={{ flex: 1, height: 44 }} />
            <div className={styles.skeletonLine} style={{ flex: 1, height: 44 }} />
            <div className={styles.skeletonLine} style={{ width: 120, height: 44 }} />
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.mediaPlaceholder} aria-hidden />
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.skeletonLine} style={{ width: 80, height: 20 }} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.skeletonLine} style={{ width: 80, height: 20 }} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.skeletonLine} style={{ width: 80, height: 20 }} />
        </div>
      </section>

      <section className={styles.dashboardPreview}>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.skeletonLine} style={{ width: "70%", height: 18 }} />
            <div className={styles.skeletonLine} style={{ height: 12, marginTop: 12 }} />
          </div>
          <div className={styles.card}>
            <div className={styles.skeletonLine} style={{ width: "70%", height: 18 }} />
            <div className={styles.skeletonLine} style={{ height: 12, marginTop: 12 }} />
          </div>
          <div className={styles.card}>
            <div className={styles.skeletonLine} style={{ width: "70%", height: 18 }} />
            <div className={styles.skeletonLine} style={{ height: 12, marginTop: 12 }} />
          </div>
        </div>
      </section>
    </main>
  );
}
