# Analyze XP requirements for character and specialization levels in Borderlands 4

from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

plt.style.use('dark_background')

def piecewise_polyfit(levels, xp, degree=2, n_segments=2, min_size=5):
    n = len(levels)
    if n_segments == 1:
        coefs = [np.polyfit(levels, xp, degree)]
        return [], coefs

    # Generate all valid combinations of split indices
    def generate_splits(n, n_segments, min_size):
        if n_segments == 1:
            return [[]]
        splits = []
        for i in range(min_size, n - min_size * (n_segments - 1)):
            for rest in generate_splits(n - i, n_segments - 1, min_size):
                splits.append([i] + [i + r for r in rest])
        return splits

    best_splits = None
    best_error = float('inf')
    best_coefs = None

    split_candidates = generate_splits(n, n_segments, min_size)
    for split_idxs in split_candidates:
        indices = [0] + split_idxs + [n]
        coefs_list = []
        mse_total = 0
        for seg in range(n_segments):
            start, end = indices[seg], indices[seg + 1]
            x_seg, y_seg = levels[start:end], xp[start:end]
            if len(x_seg) < degree + 1:
                mse_total = float('inf')
                break
            coefs = np.polyfit(x_seg, y_seg, degree)
            pred = np.polyval(coefs, x_seg)
            mse_total += np.mean((y_seg - pred) ** 2)
            coefs_list.append(coefs)
        if mse_total < best_error:
            best_error = mse_total
            best_splits = split_idxs
            best_coefs = coefs_list

    return best_splits, best_coefs

def analyze_piecewise_curve(csv_path, label, skip_levels=10, degree=3, n_segments=2, predict=False, ax=None):
    # Load and clean data
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=['points_total'])
    df['level'] = df['level'].astype(int)
    df['points_total'] = df['points_total'].astype(int)
    df = df[df['level'] > skip_levels]
    levels = df['level'].to_numpy()
    xp = df['points_total'].to_numpy()

    # Find best split and fit polynomials
    best_splits, best_coefs = piecewise_polyfit(levels, xp, degree=degree, n_segments=n_segments)
    indices = [0] + best_splits + [len(levels)]
    split_levels = [levels[i] for i in best_splits]

    print(f"\n=== {label} Piecewise Polynomial Fit (degree={degree}, segments={n_segments}) ===")
    if split_levels:
        print(f"Best splits at levels: {[int(lvl) for lvl in split_levels]}")

    # Print formulas and metrics for each segment
    for i in range(n_segments):
        start, end = indices[i], indices[i + 1]
        x_seg, y_seg = levels[start:end], xp[start:end]
        coefs = best_coefs[i]
        pred = np.polyval(coefs, x_seg)
        mse = np.mean((y_seg - pred) ** 2)
        r2 = 1 - np.sum((y_seg - pred) ** 2) / np.sum((y_seg - np.mean(y_seg)) ** 2)
        def poly_str(coefs):
            if degree == 2:
                return f"{coefs[0]:.6f} * level^2 + {coefs[1]:.6f} * level + {coefs[2]:.6f}"
            elif degree == 3:
                return f"{coefs[0]:.6f} * level^3 + {coefs[1]:.6f} * level^2 + {coefs[2]:.6f} * level + {coefs[3]:.6f}"
            else:
                return " + ".join([f'{c:.6f} * level^{degree-i}' for i, c in enumerate(coefs)])

        print(f"\nSegment {i+1} (levels {x_seg[0]} to {x_seg[-1]}):")
        print(f"  MSE: {mse:.2f}, R²: {r2:.8f}")
        print(f"\n  XP = {poly_str(coefs)}")

        # Print as JavaScript function
        print(
            "\n  return (\n"
            f"    {coefs[0]:.6f} * Math.pow(level, 3) +\n"
            f"    {coefs[1]:.6f} * Math.pow(level, 2) +\n"
            f"    {coefs[2]:.6f} * level +\n"
            f"    {coefs[3]:.6f}\n  );\n"
        )

        print("  Divergence for known data points:")
        for lvl_val, actual, pred_val in zip(x_seg, y_seg, pred):
            diff = pred_val - actual
            pct = abs(100 * diff / actual if actual != 0 else 0)
            print(f"    Level {lvl_val:3d}: {diff:+6.0f} {pct:7.5f}%")
        max_div = np.max(np.abs(y_seg - pred))
        max_div_pct = np.max(np.abs((y_seg - pred) / y_seg) * 100)
        print(f"  Max =======: {max_div:6.0f} {max_div_pct:7.5f}%")

        if predict:
            print("\n  Predicted XP for 5-level intervals within the segment:")
            start_lvl = int(x_seg[0])
            end_lvl = int(x_seg[-1])
            for lvl in range(start_lvl, end_lvl + 1, 5):
                pred = np.polyval(best_coefs[i], lvl)
                print(f"    Level {lvl:3d}: {pred:.0f}")

    # Plotting
    ax.scatter(levels, xp, label=f'XP')
    colors = ['orange', 'red', 'green', 'blue']
    for i in range(n_segments):
        start, end = indices[i], indices[i + 1]
        x_seg = levels[start:end]
        x_fine = np.linspace(x_seg.min(), x_seg.max(), 100)
        ax.plot(x_fine, np.polyval(best_coefs[i], x_fine), label=f'Fit {i+1}', color=colors[i % len(colors)])
    ax.set_xlabel('Level')
    ax.set_ylabel('Total XP')
    ax.set_title(f'{label} Piecewise Polynomial Fit')
    ax.legend()
    ax.yaxis.set_major_formatter(mticker.StrMethodFormatter('{x:,.0f}'))

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    char_csv = script_dir / '../data/xp_character.csv'
    spec_csv = script_dir / '../data/xp_specialization.csv'

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    analyze_piecewise_curve(
        char_csv,
        "Character",
        n_segments=1,
        ax=ax1
    )
    analyze_piecewise_curve(
        spec_csv,
        "Specialization",
        n_segments=4,
        ax=ax2
    )
    plt.tight_layout()
    plt.show()
