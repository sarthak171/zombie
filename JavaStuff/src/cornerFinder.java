package zomb;

import java.util.ArrayList;
import java.util.Arrays;

public class cornerFinder {
	public static void main(String[] args) {
		int[][][][] walls = new int[][][][]{
			{{{2, 1}, {2, 1}}, {{0, 0}, {2, 1}}, {{1, 1}, {0, 0}}, {{0, 0}, {2, 1}}, {{0, 0}, {2, 1}}, {{0, 0}, {2, 1}}, {{1, 2}, {0, 0}}},
		    {{{2, 1}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{1, 2}, {0, 0}}},
		    {{{2, 1}, {1, 1}}, {{0, 0}, {1, 1}}, {{0, 0}, {1, 1}}, {{0, 0}, {1, 1}}, {{1, 1}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}},
		    {{{2, 1}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{1, 1}, {0, 0}}, {{0, 0}, {1, 1}}, {{1, 2}, {0, 0}}},
		    {{{2, 1}, {1, 1}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{1, 1}, {0, 0}}, {{0, 0}, {0, 0}}, {{1, 2}, {0, 0}}},
		    {{{2, 1}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{0, 0}, {0, 0}}, {{1, 2}, {0, 0}}},
		    {{{0, 0}, {1, 2}}, {{0, 0}, {1, 2}}, {{0, 0}, {1, 2}}, {{0, 0}, {0, 0}}, {{0, 0}, {1, 2}}, {{0, 0}, {1, 2}}, {{0, 0}, {0, 0}}}
		};
		
		boolean[][] map = getMap(walls);
		double[][][] lines = getLines(map);
		double[][] points = getPoints(map);
		printMap(map);
		
		System.out.println(Arrays.deepToString(lines[0]));
		System.out.println(Arrays.deepToString(lines[1]));
		System.out.println(Arrays.deepToString(points));

		//printLines(lines);
	}
	
	public static void printMap(boolean[][] map) {
		int pr = 0;
		for(int i = 0; i<map.length; i++) {
			for(int j = 0; j<map.length; j++) {
				if(map[i][j]) pr = 1;
				else pr = 0;
				System.out.print(pr + ", ");
			}
			System.out.println();
		}
		System.out.println();
	}
	
	public static void printLines(int[][] lines) {
		
	}
	
	public static boolean[][] getMap(int[][][][] walls) {
		boolean[][] map = new boolean[walls.length*2-1][walls[0].length*2-1];
		for(int i = 0; i<walls.length; i++) {
			for(int j = 0; j<walls[i].length; j++) {
				if(walls[i][j][0][0]>0) {
					for(int k = 0; k<3; k++) {
						map[i*2+k][j*2]=true;
					}
				}
				
				if(walls[i][j][1][0]>0) {
					for(int k = 0; k<3; k++) {
						map[i*2][j*2+k]=true;
					}
				}
			}
		}
		return map;
	}
	
	public static double[][][] getLines(boolean[][] map) {
		int sa = -1;
		int sb = -1;
		
		ArrayList<int[]> vert = new ArrayList<int[]>();
		for(int j = 0; j<map[0].length; j++) {
			for(int i = 0; i<map.length; i++) {
				boolean ac = isValid(i, j-1, map.length, map[0].length) && map[i][j-1];
				boolean bc = isValid(i, j+1, map.length, map[0].length) && map[i][j+1];

				if(sa>-1) {
					if(!map[i][j] || ac) {
						vert.add(new int[] {j, sa, j, i});
						sa = -1;
					}
				} else {
					if(map[i][j] && !ac) {
						sa = i;
					}
				}
				
				if(sb>-1) {
					if(!map[i][j] || bc) {
						vert.add(new int[] {j+1, sb, j+1, i});
						sb = -1;
					}
				} else {
					if(map[i][j] && !bc) {
						sb = i;
					}
				}
			}
			
			if(sa>-1) {
				vert.add(new int[] {j, sa, j, map.length});
				sa = -1;
			}
			if(sb>-1) {
				vert.add(new int[] {j+1, sb, j+1, map.length});
				sb = -1;
			}
		}
		
		double[][] v = new double[vert.size()][4];
		for(int i = 0; i<vert.size(); i++) {
			for(int j = 0; j<4; j++) {
				v[i][j] = vert.get(i)[j]/2.0-0.25;
			}
		}
		
		ArrayList<int[]> horz = new ArrayList<int[]>();
		for(int i = 0; i<map.length; i++) {
			for(int j = 0; j<map[i].length; j++) {
				boolean ac = isValid(i-1, j, map.length, map[0].length) && map[i-1][j];
				boolean bc = isValid(i+1, j, map.length, map[0].length) && map[i+1][j];

				if(sa>-1) {
					if(!map[i][j] || ac) {
						horz.add(new int[] {sa, i, j, i});
						sa = -1;
					}
				} else {
					if(map[i][j] && !ac) {
						sa = j;
					}
				}
				
				if(sb>-1) {
					if(!map[i][j] || bc) {
						horz.add(new int[] {sb, i+1, j, i+1});
						sb = -1;
					}
				} else {
					if(map[i][j] && !bc) {
						sb = j;
					}
				}
			}
			
			if(sa>-1) {
				horz.add(new int[] {sa, i, map[i].length, i});
				sa = -1;
			}
			if(sb>-1) {
				horz.add(new int[] {sb, i+1, map[i].length, i+1});
				sb = -1;
			}
		}
		
		double[][] h = new double[horz.size()][4];
		for(int i = 0; i<horz.size(); i++) {
			for(int j = 0; j<4; j++) {
				h[i][j] = horz.get(i)[j]/2.0-0.25;
			}
		}	

		
		return new double[][][] {v, h};
	} 
	
	public static double[][] getPoints(boolean[][] map) {
		ArrayList<double[]> points = new ArrayList<double[]>();
		
		boolean[] checks = new boolean[4];
		for(int i = 0; i<map.length; i++) {
			for(int j = 0; j<map[0].length; j++) {
				if(map[i][j]) {
					checks[0] = isValid(i-1, j, map.length, map[0].length) && map[i-1][j];
					checks[1] = isValid(i, j-1, map.length, map[0].length) && map[i][j-1];
					checks[2] = isValid(i+1, j, map.length, map[0].length) && map[i+1][j];
					checks[3] = isValid(i, j+1, map.length, map[0].length) && map[i][j+1];
					
					int total = 0;
					for(int k = 0; k<4; k++) {
						if(checks[k]) total++;
					}
										
					if(total==2) {
						if(checks[0] && checks[1]) {
							//br
							points.add(new double[] {j+1, i+1});
						} else if(checks[1] && checks[2]) {
							//tr
							points.add(new double[] {j+1, i});
						} else if(checks[2] && checks[3]) {
							//tl
							points.add(new double[] {j, i});
						} else if(checks[3] && checks[0]){
							//bl
							points.add(new double[] {j, i+1});
						}
					} else if(total==1) {
						if(checks[0]) {
							//bl, br
							points.add(new double[] {j, i+1});
							points.add(new double[] {j+1, i+1});
						} else if(checks[1]) {
							//tr, br
							points.add(new double[] {j+1, i});
							points.add(new double[] {j+1, i+1});
						} else if(checks[2]) {
							//tl, tr
							points.add(new double[] {j, i});
							points.add(new double[] {j+1, i});
						} else {
							//tl, bl
							points.add(new double[] {j, i});
							points.add(new double[] {j, i+1});
						}
					}
				}
			}
		}
		
		double[][] ret = new double[points.size()][2];
		for(int i = 0; i<ret.length; i++) {
			for(int j = 0; j<2; j++) {
				ret[i][j] = points.get(i)[j]/2-0.25;
			}
		}
		
		return ret;
	}
	
	public static boolean isValid(int r, int c, int h, int w) {
		if(r>=0 && r<h && c>=0 && c<w) return true;
		else return false;
	}
}
